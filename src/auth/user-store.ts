import crypto from 'crypto'
import type { RbacRole } from './jwt-service'

export type UserRole = 'admin' | 'user' | 'guest' | 'student' | 'instructor'

export interface User {
  id: string
  email: string
  passwordHash: string
  salt: string
  roles: RbacRole[]
  createdAt: Date
  lastLoginAt?: Date
  isActive: boolean
  failedLoginAttempts: number
  lockedUntil?: Date
}

export interface CreateUserInput {
  email: string
  password: string
  roles?: RbacRole[]
}

const LOCKOUT_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 30 * 60 * 1000 // 30 minutes

export class UserStore {
  private users = new Map<string, User>()
  private emailIndex = new Map<string, string>() // email -> id
  private _ready: Promise<void>

  constructor() {
    this._ready = this.seed()
  }

  get ready(): Promise<void> {
    return this._ready
  }

  private async seed() {
    // Map legacy roles to RbacRole[]: admin→admin, instructor→editor, student→viewer, user→viewer
    await this.createInternal({ email: 'admin@example.com', password: 'AdminPass1!', roles: ['admin'] })
    await this.createInternal({ email: 'instructor@example.com', password: 'InstructorPass1!', roles: ['editor'] })
    await this.createInternal({ email: 'student@example.com', password: 'StudentPass1!', roles: ['viewer'] })
    await this.createInternal({ email: 'user@example.com', password: 'UserPass1!', roles: ['viewer'] })
    const inactive = await this.createInternal({ email: 'inactive@example.com', password: 'InactivePass1!', roles: ['viewer'] })
    await this.update(inactive.id, { isActive: false })
  }

  private generateId(): string {
    return crypto.randomUUID()
  }

  async hashPassword(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password + salt)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    return Buffer.from(hashBuffer).toString('hex')
  }

  async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    const computed = await this.hashPassword(password, salt)
    return computed === hash
  }

  private generateSalt(): string {
    return crypto.randomBytes(16).toString('hex')
  }

  private async createInternal(input: CreateUserInput): Promise<User> {
    const salt = this.generateSalt()
    const passwordHash = await this.hashPassword(input.password, salt)
    const user: User = {
      id: this.generateId(),
      email: input.email,
      passwordHash,
      salt,
      roles: input.roles ?? ['viewer'],
      createdAt: new Date(),
      isActive: true,
      failedLoginAttempts: 0,
    }
    this.users.set(user.id, user)
    this.emailIndex.set(user.email, user.id)
    return user
  }

  async create(input: CreateUserInput): Promise<User> {
    if (this.emailIndex.has(input.email)) {
      throw new Error('Email already exists')
    }
    return this.createInternal(input)
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.get(id)
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const id = this.emailIndex.get(email)
    if (!id) return undefined
    return this.users.get(id)
  }

  async update(id: string, updates: Partial<Omit<User, 'id'>>): Promise<User | undefined> {
    const user = this.users.get(id)
    if (!user) return undefined
    const updated = { ...user, ...updates }
    this.users.set(id, updated)
    if (updates.email && updates.email !== user.email) {
      this.emailIndex.delete(user.email)
      this.emailIndex.set(updates.email, id)
    }
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const user = this.users.get(id)
    if (!user) return false
    this.emailIndex.delete(user.email)
    this.users.delete(id)
    return true
  }

  async recordFailedLogin(id: string): Promise<void> {
    const user = this.users.get(id)
    if (!user) return
    const attempts = user.failedLoginAttempts + 1
    const updates: Partial<User> = { failedLoginAttempts: attempts }
    if (attempts >= LOCKOUT_ATTEMPTS) {
      updates.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS)
    }
    await this.update(id, updates)
  }

  async resetFailedAttempts(id: string): Promise<void> {
    await this.update(id, { failedLoginAttempts: 0, lockedUntil: undefined })
  }

  isLocked(user: User): boolean {
    if (!user.lockedUntil) return false
    return user.lockedUntil > new Date()
  }
}
