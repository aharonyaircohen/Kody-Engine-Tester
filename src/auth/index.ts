import { UserStore } from './user-store'
import { SessionStore } from './session-store'
import { JwtService } from './jwt-service'
import { AuthService } from './auth-service'
import { OAuthPKCEService } from './oauth-pkce-service'
import { getPayloadInstance } from '@/services/progress'

export const userStore = new UserStore()
export const sessionStore = new SessionStore()
export const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')

// Lazy-loaded service instances
let authServiceInstance: AuthService | null = null
let oauthServiceInstance: OAuthPKCEService | null = null

export async function getAuthService(): Promise<AuthService> {
  if (!authServiceInstance) {
    const payload = await getPayloadInstance()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authServiceInstance = new AuthService(payload as any, jwtService)
  }
  return authServiceInstance
}

export async function getOAuthService(): Promise<OAuthPKCEService> {
  if (!oauthServiceInstance) {
    const payload = await getPayloadInstance()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    oauthServiceInstance = new OAuthPKCEService(payload as any, jwtService)
  }
  return oauthServiceInstance
}

export type { User, UserRole, CreateUserInput } from './user-store'
export type { Session } from './session-store'
export type { TokenPayload, TenantRole, RbacRole } from './jwt-service'
export type { AuthenticatedUser, AuthResult } from './auth-service'
export type { OAuthProvider } from './oauth-pkce-service'
