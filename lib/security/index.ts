/**
 * 🔐 NEXUS SECURITY LAYER (v1.0)
 * Central Hub for all security modules.
 */

export * from './auth'
export * from './tenant'
export * from './permissions'
export * from './realtime'
export * from './rate-limit'
export * from './audit'
export * from './withSecurity'

/**
 * 🧱 HARD ENFORCEMENT: Block accidental tenant leaks
 */
export function enforceTenant(sessionCompanyId: string, inputCompanyId?: string) {
    if (inputCompanyId && inputCompanyId !== sessionCompanyId) {
        throw new Error('TENANT VIOLATION DETECTED: Input companyId mismatch session context');
    }
}
