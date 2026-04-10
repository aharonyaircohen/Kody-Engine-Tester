/**
 * User domain model types
 * @module models/user
 */

export interface User {
  id: string
  email: string
  passwordHash: string
  createdAt: Date
}
