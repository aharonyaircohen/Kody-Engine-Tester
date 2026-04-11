import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword, type User } from './user-model'

describe('hashPassword', () => {
  it('produces different output for same input due to salt', async () => {
    const password = 'TestPassword123!'
    const hash1 = await hashPassword(password)
    const hash2 = await hashPassword(password)
    expect(hash1).not.toBe(hash2)
  })

  it('produces a hash that can be verified', async () => {
    const password = 'TestPassword123!'
    const hash = await hashPassword(password)
    const isValid = await verifyPassword(password, hash)
    expect(isValid).toBe(true)
  })

  it('rejects wrong password', async () => {
    const password = 'TestPassword123!'
    const hash = await hashPassword(password)
    const isValid = await verifyPassword('WrongPassword!', hash)
    expect(isValid).toBe(false)
  })
})

describe('User interface', () => {
  it('has correct field types', async () => {
    const user: User = {
      id: crypto.randomUUID(),
      email: 'test@example.com',
      passwordHash: await hashPassword('test'),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    expect(typeof user.id).toBe('string')
    expect(typeof user.email).toBe('string')
    expect(typeof user.passwordHash).toBe('string')
    expect(user.createdAt instanceof Date).toBe(true)
    expect(user.updatedAt instanceof Date).toBe(true)
  })
})