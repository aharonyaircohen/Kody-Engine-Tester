import { JwtService } from './jwt-service'
import { AuthService } from './auth-service'
import { getPayloadInstance } from '@/services/progress'

export { AuthService }
export { JwtService }

export type { RbacRole, AuthenticatedUser, AuthResult } from './auth-service'
export type { TokenPayload } from './jwt-service'

let jwtServiceInstance: JwtService | null = null
let authServiceInstance: AuthService | null = null

export function getJwtService(): JwtService {
  if (!jwtServiceInstance) {
    jwtServiceInstance = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
  }
  return jwtServiceInstance
}

export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authServiceInstance = new AuthService(getPayloadInstance() as any, getJwtService())
  }
  return authServiceInstance
}
