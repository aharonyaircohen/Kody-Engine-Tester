/**
 * User domain model types
 * @module models/user
 */

import crypto from 'crypto'
import bcrypt from 'bcryptjs'

const BCRYPT_COST_FACTOR = 12

export interface User {
  id: string
  email: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserInput {
  email: string
  password: string
}

export class UserModel {
  private users = new Map<string, User>()
  private emailIndex = new Map<string, string>() // email -> id

  private generateId(): string {
    return crypto.randomUUID()
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_COST_FACTOR)
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  async create(input: CreateUserInput): Promise<User> {
    if (!input.email || input.email.trim().length === 0) {
      throw new Error('Email is required')
    }

    if (!this.isValidEmail(input.email)) {
      throw new Error('Invalid email format')
    }

    if (!input.password || input.password.length === 0) {
      throw new Error('Password is required')
    }

    const normalizedEmail = input.email.toLowerCase().trim()

    if (this.emailIndex.has(normalizedEmail)) {
      throw new Error('Email already exists')
    }

    const passwordHash = await this.hashPassword(input.password)

    const user: User = {
      id: this.generateId(),
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.users.set(user.id, user)
    this.emailIndex.set(normalizedEmail, user.id)

    return user
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.get(id)
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const normalizedEmail = email.toLowerCase().trim()
    const id = this.emailIndex.get(normalizedEmail)
    if (!id) return undefined
    return this.users.get(id)
  }

  async update(id: string, updates: Partial<Omit<User, 'id'>>): Promise<User | undefined> {
    const user = this.users.get(id)
    if (!user) return undefined

    if (updates.email) {
      const normalizedEmail = updates.email.toLowerCase().trim()
      if (this.emailIndex.has(normalizedEmail) && this.emailIndex.get(normalizedEmail) !== id) {
        throw new Error('Email already exists')
      }
      this.emailIndex.delete(user.email)
      this.emailIndex.set(normalizedEmail, id)
    }

    const updated: User = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    }

    this.users.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const user = this.users.get(id)
    if (!user) return false
    this.emailIndex.delete(user.email)
    this.users.delete(id)
    return true
  }
}