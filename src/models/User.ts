/**
 * User domain model types
 * @module models/User
 */

export interface User {
  id: string
  email: string
  passwordHash: string
  salt: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserInput {
  email: string
  password: string
}

export interface UserFilter {
  email?: string
}
