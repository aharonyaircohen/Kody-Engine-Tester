import { describe, it, expect, beforeEach } from 'vitest'
import { JwtAuthStore } from './jwt-auth-store'

describe('JwtAuthStore', () => {
  let store: JwtAuthStore

  beforeEach(() => {
    store = new JwtAuthStore()
  })

  describe('create', () => {
    it('should create a token entry with all fields', () => {
      const stored = store.create('user-1', 'token-1', 'refresh-1')
      expect(stored.userId).toBe('user-1')
      expect(stored.token).toBe('token-1')
      expect(stored.refreshToken).toBe('refresh-1')
      expect(stored.expiresAt).toBeDefined()
      expect(stored.refreshExpiresAt).toBeDefined()
      expect(stored.createdAt).toBeDefined()
      expect(stored.generation).toBe(0)
    })
  })

  describe('findByToken', () => {
    it('should find token entry by access token', () => {
      const stored = store.create('user-1', 'token-1', 'refresh-1')
      const found = store.findByToken('token-1')
      expect(found?.token).toBe(stored.token)
    })

    it('should return undefined for unknown token', () => {
      expect(store.findByToken('unknown')).toBeUndefined()
    })

    it('should return undefined for expired token', () => {
      const stored = store.create('user-1', 'token-1', 'refresh-1')
      store['tokens'].set(stored.token, { ...stored, expiresAt: new Date(Date.now() - 1000) })
      expect(store.findByToken('token-1')).toBeUndefined()
    })
  })

  describe('findByRefreshToken', () => {
    it('should find token entry by refresh token', () => {
      const stored = store.create('user-1', 'token-1', 'refresh-1')
      const found = store.findByRefreshToken('refresh-1')
      expect(found?.token).toBe(stored.token)
    })

    it('should return undefined for expired refresh token', () => {
      const stored = store.create('user-1', 'token-1', 'refresh-1')
      store['tokens'].set(stored.token, { ...stored, refreshExpiresAt: new Date(Date.now() - 1000) })
      expect(store.findByRefreshToken('refresh-1')).toBeUndefined()
    })
  })

  describe('refresh', () => {
    it('should rotate tokens and increment generation', () => {
      const stored = store.create('user-1', 'token-1', 'refresh-1')
      const updated = store.refresh('token-1', 'token-2', 'refresh-2')
      expect(updated?.token).toBe('token-2')
      expect(updated?.refreshToken).toBe('refresh-2')
      expect(updated?.generation).toBe(1)
      expect(store.findByToken('token-1')).toBeUndefined()
      expect(store.findByToken('token-2')).toBeDefined()
    })

    it('should return undefined for unknown token', () => {
      expect(store.refresh('unknown', 'token-2', 'refresh-2')).toBeUndefined()
    })
  })

  describe('generation', () => {
    it('should start at generation 0', () => {
      const stored = store.create('user-1', 'token-1', 'refresh-1')
      expect(stored.generation).toBe(0)
      expect(store.getGeneration('token-1')).toBe(0)
    })

    it('should increment generation on refresh', () => {
      const stored = store.create('user-1', 'token-1', 'refresh-1')
      const updated = store.refresh('token-1', 'token-2', 'refresh-2')
      expect(updated?.generation).toBe(1)
    })
  })

  describe('revoke', () => {
    it('should remove token entry', () => {
      const stored = store.create('user-1', 'token-1', 'refresh-1')
      store.revoke('token-1')
      expect(store.findByToken('token-1')).toBeUndefined()
    })
  })

  describe('revokeAllForUser', () => {
    it('should revoke all tokens for a user', () => {
      store.create('user-1', 'token-1', 'refresh-1')
      store.create('user-1', 'token-2', 'refresh-2')
      store.create('user-2', 'token-3', 'refresh-3')
      store.revokeAllForUser('user-1')
      expect(store.findByToken('token-1')).toBeUndefined()
      expect(store.findByToken('token-2')).toBeUndefined()
      expect(store.findByToken('token-3')).toBeDefined()
    })
  })

  describe('max tokens', () => {
    it('should evict oldest token when exceeding max 5', () => {
      for (let i = 0; i < 5; i++) {
        store.create('user-1', `token-${i}`, `refresh-${i}`)
      }
      store.create('user-1', 'token-5', 'refresh-5')
      expect(store.findByToken('token-0')).toBeUndefined()
      expect(store.findByToken('token-5')).toBeDefined()
    })
  })

  describe('cleanup', () => {
    it('should remove expired tokens', () => {
      const stored = store.create('user-1', 'token-1', 'refresh-1')
      store['tokens'].set(stored.token, {
        ...stored,
        expiresAt: new Date(Date.now() - 1000),
        refreshExpiresAt: new Date(Date.now() - 1000),
      })
      store.cleanup()
      expect(store['tokens'].has(stored.token)).toBe(false)
    })
  })
})