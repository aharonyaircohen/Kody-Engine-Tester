import { UserStore } from './user-store'
import { SessionStore } from './session-store'
import { JwtService } from './jwt-service'

/**
 * @deprecated userStore is deprecated — use AuthService (Payload-based PBKDF2 auth) instead.
 * See src/auth/auth-service.ts. userStore uses in-memory SHA-256 hashing which is
 * inconsistent with the Payload-based auth system and will be removed in a future release.
 */
export const userStore = new UserStore()
export const sessionStore = new SessionStore()
export const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')

export type { User, UserRole, CreateUserInput } from './user-store'
export type { Session } from './session-store'
export type { TokenPayload } from './jwt-service'
