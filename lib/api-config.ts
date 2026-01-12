export const getApiUrl = (path: string) => {
    // In development (web) or if configured, use relative paths defaults
    // In production (mobile app), we need the full URL from env var
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${baseUrl}${cleanPath}`;
}
