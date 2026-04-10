import { UserStore } from './user-store'
import { JwtAuthStore } from './jwt-auth-store'
import { JwtService } from './jwt-service'

export const userStore = new UserStore()
export const jwtAuthStore = new JwtAuthStore()
export const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')

export type { User, RbacRole, CreateUserInput } from './user-store'
export type { TokenPayload } from './jwt-service'
