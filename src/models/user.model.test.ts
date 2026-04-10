import { describe, it, expect, beforeEach } from 'vitest'
import { UserModel } from './user.model'

describe('UserModel', () => {
  let model: UserModel

  beforeEach(() => {
    model = new UserModel()
  })

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const user = await model.create({ email: 'test@example.com', password: 'Password123!' })
      expect(user.id).toBeDefined()
      expect(user.email).toBe('test@example.com')
      expect(user.passwordHash).not.toBe('Password123!')
      expect(user.createdAt).toBeInstanceOf(Date)
      expect(user.updatedAt).toBeInstanceOf(Date)
    })

    it('should normalize email to lowercase', async () => {
      const user = await model.create({ email: 'TEST@EXAMPLE.COM', password: 'Password123!' })
      expect(user.email).toBe('test@example.com')
    })

    it('should throw on duplicate email', async () => {
      await model.create({ email: 'test@example.com', password: 'Password123!' })
      await expect(model.create({ email: 'test@example.com', password: 'Password456!' }))
        .rejects.toThrow('Email already exists')
    })
  })

  describe('findById', () => {
    it('should find existing user', async () => {
      const created = await model.create({ email: 'test@example.com', password: 'Password123!' })
      const found = await model.findById(created.id)
      expect(found).toEqual(created)
    })

    it('should return undefined for unknown id', async () => {
      const found = await model.findById('nonexistent')
      expect(found).toBeUndefined()
    })
  })

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      await model.create({ email: 'test@example.com', password: 'Password123!' })
      const found = await model.findByEmail('test@example.com')
      expect(found?.email).toBe('test@example.com')
    })

    it('should return undefined for unknown email', async () => {
      const found = await model.findByEmail('unknown@example.com')
      expect(found).toBeUndefined()
    })
  })

  describe('password verification', () => {
    it('should verify correct password', async () => {
      await model.create({ email: 'test@example.com', password: 'Password123!' })
      const user = await model.findByEmail('test@example.com')
      const valid = await model.verifyPassword('Password123!', user!.passwordHash)
      expect(valid).toBe(true)
    })

    it('should reject wrong password', async () => {
      await model.create({ email: 'test@example.com', password: 'Password123!' })
      const user = await model.findByEmail('test@example.com')
      const valid = await model.verifyPassword('WrongPassword!', user!.passwordHash)
      expect(valid).toBe(false)
    })
  })

  describe('edge cases - empty email', () => {
    it('should throw on empty email', async () => {
      await expect(model.create({ email: '', password: 'Password123!' }))
        .rejects.toThrow('Email is required')
    })

    it('should throw on whitespace-only email', async () => {
      await expect(model.create({ email: '   ', password: 'Password123!' }))
        .rejects.toThrow('Email is required')
    })
  })

  describe('edge cases - invalid email format', () => {
    it('should throw on email without @', async () => {
      await expect(model.create({ email: 'invalid-email', password: 'Password123!' }))
        .rejects.toThrow('Invalid email format')
    })

    it('should throw on email without domain', async () => {
      await expect(model.create({ email: 'user@', password: 'Password123!' }))
        .rejects.toThrow('Invalid email format')
    })

    it('should throw on email without local part', async () => {
      await expect(model.create({ email: '@example.com', password: 'Password123!' }))
        .rejects.toThrow('Invalid email format')
    })
  })

  describe('edge cases - empty password', () => {
    it('should throw on empty password', async () => {
      await expect(model.create({ email: 'test@example.com', password: '' }))
        .rejects.toThrow('Password is required')
    })
  })

  describe('update', () => {
    it('should update user email', async () => {
      const user = await model.create({ email: 'test@example.com', password: 'Password123!' })
      const updated = await model.update(user.id, { email: 'new@example.com' })
      expect(updated?.email).toBe('new@example.com')
    })

    it('should throw on duplicate email during update', async () => {
      await model.create({ email: 'test@example.com', password: 'Password123!' })
      const user2 = await model.create({ email: 'other@example.com', password: 'Password123!' })
      await expect(model.update(user2.id, { email: 'test@example.com' }))
        .rejects.toThrow('Email already exists')
    })

    it('should update updatedAt timestamp', async () => {
      const user = await model.create({ email: 'test@example.com', password: 'Password123!' })
      const originalUpdatedAt = user.updatedAt
      // Small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10))
      const updated = await model.update(user.id, { email: 'new@example.com' })
      expect(updated!.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
    })
  })

  describe('delete', () => {
    it('should delete a user', async () => {
      const user = await model.create({ email: 'test@example.com', password: 'Password123!' })
      const result = await model.delete(user.id)
      expect(result).toBe(true)
      expect(await model.findById(user.id)).toBeUndefined()
    })

    it('should return false for unknown id', async () => {
      const result = await model.delete('nonexistent')
      expect(result).toBe(false)
    })
  })
})