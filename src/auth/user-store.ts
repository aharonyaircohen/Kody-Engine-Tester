import crypto from 'crypto'
import type { OAuth2Provider } from './oauth2'

export type UserRole = 'admin' | 'editor' | 'viewer'

export interface LinkedAccount {
  provider: OAuth2Provider
  providerId: string
  linkedAt: Date
}

export interface User {
  id: string
  email: string
  passwordHash: string
  salt: string
  role: UserRole
  createdAt: Date
  lastLoginAt?: Date
  isActive: boolean
  failedLoginAttempts: number
  lockedUntil?: Date
  provider?: OAuth2Provider
  providerId?: string
  linkedAccounts?: LinkedAccount[]
}

export interface CreateUserInput {
  email: string
  password: string
  role?: UserRole
  provider?: OAuth2Provider
  providerId?: string
}

export interface OAuthCreateUserInput {
  email: string
  provider: OAuth2Provider
  providerId: string
  name?: string
  role?: UserRole
}

const LOCKOUT_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 30 * 60 * 1000 // 30 minutes

export class UserStore {
  private users = new Map<string, User>()
  private emailIndex = new Map<string, string>() // email -> id
  private providerIndex = new Map<string, string>() // provider:providerId -> userId
  private _ready: Promise<void>

  constructor() {
    this._ready = this.seed()
  }

  get ready(): Promise<void> {
    return this._ready
  }

  private async seed() {
    await this.createInternal({ email: 'admin@example.com', password: 'AdminPass1!', role: 'admin' })
    await this.createInternal({ email: 'editor@example.com', password: 'EditorPass1!', role: 'editor' })
    await this.createInternal({ email: 'viewer@example.com', password: 'ViewerPass1!', role: 'viewer' })
    const inactive = await this.createInternal({ email: 'inactive@example.com', password: 'InactivePass1!', role: 'viewer' })
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
      role: input.role ?? 'viewer',
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
    await this.deleteProviderIndex(id)
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

  async findByProvider(provider: OAuth2Provider, providerId: string): Promise<User | undefined> {
    const userId = this.providerIndex.get(`${provider}:${providerId}`)
    if (!userId) return undefined
    return this.users.get(userId)
  }

  async createOAuth(input: OAuthCreateUserInput): Promise<User> {
    const existingByEmail = await this.findByEmail(input.email)
    if (existingByEmail) {
      throw new Error('Email already exists')
    }

    const user: User = {
      id: this.generateId(),
      email: input.email,
      passwordHash: '',
      salt: '',
      role: input.role ?? 'viewer',
      provider: input.provider,
      providerId: input.providerId,
      linkedAccounts: [],
      createdAt: new Date(),
      isActive: true,
      failedLoginAttempts: 0,
    }
    this.users.set(user.id, user)
    this.emailIndex.set(user.email, user.id)
    this.providerIndex.set(`${input.provider}:${input.providerId}`, user.id)
    return user
  }

  async linkAccount(userId: string, provider: OAuth2Provider, providerId: string): Promise<void> {
    const user = this.users.get(userId)
    if (!user) throw new Error('User not found')

    const existingProviderUser = await this.findByProvider(provider, providerId)
    if (existingProviderUser && existingProviderUser.id !== userId) {
      throw new Error('Provider account already linked to another user')
    }

    if (!user.linkedAccounts) {
      user.linkedAccounts = []
    }

    const alreadyLinked = user.linkedAccounts.some((a) => a.provider === provider && a.providerId === providerId)
    if (alreadyLinked) {
      throw new Error('Provider already linked')
    }

    user.linkedAccounts.push({ provider, providerId, linkedAt: new Date() })
    this.providerIndex.set(`${provider}:${providerId}`, userId)
    this.users.set(userId, user)
  }

  async unlinkAccount(userId: string, provider: OAuth2Provider): Promise<void> {
    const user = this.users.get(userId)
    if (!user) throw new Error('User not found')

    if (!user.linkedAccounts) {
      return
    }

    const idx = user.linkedAccounts.findIndex((a) => a.provider === provider)
    if (idx === -1) {
      throw new Error('Provider not linked')
    }

    const removed = user.linkedAccounts.splice(idx, 1)[0]
    this.providerIndex.delete(`${removed.provider}:${removed.providerId}`)
    this.users.set(userId, user)
  }

  async getLinkedAccounts(userId: string): Promise<LinkedAccount[]> {
    const user = this.users.get(userId)
    if (!user) throw new Error('User not found')
    return user.linkedAccounts ?? []
  }

  async deleteProviderIndex(userId: string): Promise<void> {
    const user = this.users.get(userId)
    if (!user) return
    if (user.provider) {
      this.providerIndex.delete(`${user.provider}:${user.providerId}`)
    }
    if (user.linkedAccounts) {
      for (const account of user.linkedAccounts) {
        this.providerIndex.delete(`${account.provider}:${account.providerId}`)
      }
    }
  }
}
