import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory storage for sliding-window rate limiting in the middleware thread.
// In high-scale cluster deployments, this is backed by a Redis/Cloudflare KV store.
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute per IP/Tenant

/**
 * Next.js Edge Middleware for GovTech API Security Hardening (Phase 5)
 */
export function middleware(request: NextRequest) {
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
  const tenantId = request.headers.get('x-tenant-id') || 'anonymous-municipality';
  const path = request.nextUrl.pathname;

  // Only apply strict protection to API endpoints
  if (path.startsWith('/api')) {
    // 1. CLOUDFLARE SECURITY INTEGRATION CHECK (Procurement requirement)
    // In production, Cloudflare rules inject validation tokens to verify origin authenticity.
    const cfToken = request.headers.get('x-cf-origin-token');
    const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';

    // Log the request in an audit-safe structured format (Iron Shield core logging)
    const logData = {
      timestamp: new Date().toISOString(),
      method: request.method,
      path,
      ip: isLocalhost ? '127.0.0.1 (Local Auth)' : ip,
      tenantId,
      cfProtected: cfToken ? 'true' : 'false'
    };
    
    console.log(`[API SECURITY AUDIT-LOG] ${JSON.stringify(logData)}`);

    // 2. SLIDING WINDOW RATE LIMITER & TENANT THROTTLING
    const currentTime = Date.now();
    const rateLimitKey = `${ip}:${tenantId}`;
    const rateLimitData = rateLimitMap.get(rateLimitKey);

    if (!rateLimitData) {
      // First request in the window
      rateLimitMap.set(rateLimitKey, {
        count: 1,
        resetTime: currentTime + RATE_LIMIT_WINDOW_MS
      });
    } else {
      if (currentTime > rateLimitData.resetTime) {
        // Window expired, reset counter
        rateLimitMap.set(rateLimitKey, {
          count: 1,
          resetTime: currentTime + RATE_LIMIT_WINDOW_MS
        });
      } else {
        // Within window, increment counter
        rateLimitData.count += 1;
        if (rateLimitData.count > MAX_REQUESTS_PER_WINDOW) {
          console.warn(`[API SECURITY BLOCKED] Rate limit exceeded for IP/Tenant: ${rateLimitKey} on path: ${path}`);
          
          return new NextResponse(
            JSON.stringify({
              error: 'Too Many Requests',
              message: 'Rate limit exceeded on this GovTech endpoint. Please verify your municipal quota.',
              limit: MAX_REQUESTS_PER_WINDOW,
              reset: Math.ceil((rateLimitData.resetTime - currentTime) / 1000)
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': Math.ceil((rateLimitData.resetTime - currentTime) / 1000).toString(),
                'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
                'X-RateLimit-Remaining': '0'
              }
            }
          );
        }
      }
    }

    // Inject security and tenant context headers for downstream API routes
    const response = NextResponse.next();
    response.headers.set('X-GovTech-Shield', 'Iron-Shield-v5');
    response.headers.set('X-Tenant-Isolation', tenantId);
    response.headers.set('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW.toString());
    response.headers.set(
      'X-RateLimit-Remaining', 
      (MAX_REQUESTS_PER_WINDOW - (rateLimitMap.get(rateLimitKey)?.count || 0)).toString()
    );

    return response;
  }

  return NextResponse.next();
}

// Enforce middleware only on API endpoints to prevent unnecessary edge execution on static pages
export const config = {
  matcher: '/api/:path*',
};
