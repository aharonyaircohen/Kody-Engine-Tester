import { SessionStore } from './session-store'
import { JwtService } from './jwt-service'

// DEPRECATED: UserStore is deprecated. Use AuthService for production auth.
// @deprecated Use AuthService with Payload CMS instead
export { UserStore } from './user-store'
export const sessionStore = new SessionStore()
export const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')

export type { User, UserRole, CreateUserInput } from './user-store'
export type { Session } from './session-store'
export type { TokenPayload } from './jwt-service'

// AuthService types (production auth system)
export type { AuthenticatedUser, AuthResult, RbacRole, TokenFields } from './auth-service'