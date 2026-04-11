import { UserStore } from './user-store'
import { SessionStore } from './session-store'
import { JwtService } from './jwt-service'

export const userStore = new UserStore()
export const sessionStore = new SessionStore()
export const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')

let jwtServiceInstance: JwtService | null = null

export function getJwtService(): JwtService {
  if (!jwtServiceInstance) {
    jwtServiceInstance = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
  }
  return jwtServiceInstance
}

export type { User, UserRole, CreateUserInput } from './user-store'
export type { Session } from './session-store'
export type { TokenPayload } from './jwt-service'
