import { UserStore } from './user-store'
import { SessionStore } from './session-store'
import { JwtService } from './jwt-service'

export const userStore = new UserStore()
export const sessionStore = new SessionStore()
export const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')

export type { User, UserRole, CreateUserInput } from './user-store'
export type { Session } from './session-store'
export type { TokenPayload } from './jwt-service'
export type { AuthenticatedUser, RbacRole, TenantPermission, TenantContext } from './auth-service'
export type { OAuth2Provider, OAuth2Config, OAuth2TokenResponse, OAuth2UserInfo, PkcePair } from './oauth2-pkce'
export {
  generatePkcePair,
  generateCodeVerifier,
  generateCodeChallenge,
  buildAuthorizationUrl,
  exchangeCodeForTokens,
  fetchUserInfo,
  generateState,
  validateState,
} from './oauth2-pkce'
