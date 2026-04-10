import { UserStore } from './user-store'
import { JwtService } from './jwt-service'

export const userStore = new UserStore()

// Initialize JWT service with RS256 keys from environment
function createJwtService(): JwtService {
  const privateKey = process.env.JWT_PRIVATE_KEY
  const publicKey = process.env.JWT_PUBLIC_KEY
  if (privateKey && publicKey) {
    return new JwtService(privateKey, publicKey)
  }
  // Fallback for development without keys - will throw at runtime if used
  return new JwtService()
}

export const jwtService = createJwtService()

export type { User, UserRole, CreateUserInput } from './user-store'
export type { TokenPayload, RbacRole } from './jwt-service'
export type { AuthenticatedUser, AuthResult } from './auth-service'