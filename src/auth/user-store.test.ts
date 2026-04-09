import { describe, it, expect, beforeEach } from 'vitest'
import { UserStore } from './user-store'

describe('UserStore', () => {
  let store: UserStore

  beforeEach(async () => {
    store = new UserStore()
    await store.ready
  })

  describe('seed users', () => {
    it('should have admin user seeded', async () => {
      const admin = await store.findByEmail('admin@example.com')
      expect(admin).toBeDefined()
      expect(admin?.roles).toContain('admin')
    })

    it('should have regular user seeded', async () => {
      const user = await store.findByEmail('user@example.com')
      expect(user).toBeDefined()
      expect(user?.roles).toContain('viewer')
    })

    it('should have inactive user seeded', async () => {
      const inactive = await store.findByEmail('inactive@example.com')
      expect(inactive).toBeDefined()
      expect(inactive?.isActive).toBe(false)
    })
  })

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const user = await store.create({ email: 'new@example.com', password: 'Password1!', roles: ['viewer'] })
      expect(user.id).toBeDefined()
      expect(user.email).toBe('new@example.com')
      expect(user.roles).toContain('viewer')
      expect(user.passwordHash).not.toBe('Password1!')
      expect(user.isActive).toBe(true)
      expect(user.failedLoginAttempts).toBe(0)
    })

    it('should throw on duplicate email', async () => {
      await expect(store.create({ email: 'admin@example.com', password: 'Password1!', roles: ['viewer'] }))
        .rejects.toThrow('Email already exists')
    })
  })

  describe('findById', () => {
    it('should find existing user', async () => {
      const admin = await store.findByEmail('admin@example.com')
      const found = await store.findById(admin!.id)
      expect(found).toEqual(admin)
    })

    it('should return undefined for unknown id', async () => {
      const found = await store.findById('nonexistent')
      expect(found).toBeUndefined()
    })
  })

  describe('findByEmail', () => {
    it('should return undefined for unknown email', async () => {
      const found = await store.findByEmail('unknown@example.com')
      expect(found).toBeUndefined()
    })
  })

  describe('update', () => {
    it('should update user fields', async () => {
      const user = await store.findByEmail('user@example.com')
      const updated = await store.update(user!.id, { email: 'updated@example.com' })
      expect(updated?.email).toBe('updated@example.com')
    })

    it('should return undefined for unknown id', async () => {
      const updated = await store.update('nonexistent', { email: 'x@x.com' })
      expect(updated).toBeUndefined()
    })
  })

  describe('delete', () => {
    it('should delete a user', async () => {
      const user = await store.findByEmail('user@example.com')
      const result = await store.delete(user!.id)
      expect(result).toBe(true)
      expect(await store.findById(user!.id)).toBeUndefined()
    })

    it('should return false for unknown id', async () => {
      expect(await store.delete('nonexistent')).toBe(false)
    })
  })

  describe('password verification', () => {
    it('should verify correct password', async () => {
      const user = await store.findByEmail('admin@example.com')
      const valid = await store.verifyPassword('AdminPass1!', user!.passwordHash, user!.salt)
      expect(valid).toBe(true)
    })

    it('should reject wrong password', async () => {
      const user = await store.findByEmail('admin@example.com')
      const valid = await store.verifyPassword('wrongpassword', user!.passwordHash, user!.salt)
      expect(valid).toBe(false)
    })
  })

  describe('account lockout', () => {
    it('should lock account after 5 failed attempts', async () => {
      const user = await store.findByEmail('user@example.com')
      for (let i = 0; i < 5; i++) {
        await store.recordFailedLogin(user!.id)
      }
      const updated = await store.findById(user!.id)
      expect(store.isLocked(updated!)).toBe(true)
      expect(updated?.lockedUntil).toBeDefined()
    })

    it('should not lock before 5 attempts', async () => {
      const user = await store.findByEmail('user@example.com')
      for (let i = 0; i < 4; i++) {
        await store.recordFailedLogin(user!.id)
      }
      const updated = await store.findById(user!.id)
      expect(store.isLocked(updated!)).toBe(false)
    })

    it('should not be locked if lockout has expired', async () => {
      const user = await store.findByEmail('user@example.com')
      for (let i = 0; i < 5; i++) {
        await store.recordFailedLogin(user!.id)
      }
      // Manually expire the lock
      await store.update(user!.id, { lockedUntil: new Date(Date.now() - 1000) })
      const updated = await store.findById(user!.id)
      expect(store.isLocked(updated!)).toBe(false)
    })

    it('should reset failed attempts', async () => {
      const user = await store.findByEmail('user@example.com')
      await store.recordFailedLogin(user!.id)
      await store.recordFailedLogin(user!.id)
      await store.resetFailedAttempts(user!.id)
      const updated = await store.findById(user!.id)
      expect(updated?.failedLoginAttempts).toBe(0)
      expect(updated?.lockedUntil).toBeUndefined()
    })
  })
})
