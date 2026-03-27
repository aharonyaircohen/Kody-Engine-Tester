import { describe, it, expect, beforeEach } from 'vitest'
import { SessionStore } from './session-store'

describe('SessionStore', () => {
  let store: SessionStore

  beforeEach(() => {
    store = new SessionStore()
  })

  describe('create', () => {
    it('should create a session with all fields', () => {
      const session = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'Mozilla/5.0')
      expect(session.id).toBeDefined()
      expect(session.userId).toBe('user-1')
      expect(session.token).toBe('token-1')
      expect(session.refreshToken).toBe('refresh-1')
      expect(session.ipAddress).toBe('127.0.0.1')
      expect(session.userAgent).toBe('Mozilla/5.0')
      expect(session.expiresAt).toBeDefined()
      expect(session.refreshExpiresAt).toBeDefined()
      expect(session.createdAt).toBeDefined()
    })
  })

  describe('findByToken', () => {
    it('should find session by access token', () => {
      const session = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
      const found = store.findByToken('token-1')
      expect(found?.id).toBe(session.id)
    })

    it('should return undefined for unknown token', () => {
      expect(store.findByToken('unknown')).toBeUndefined()
    })

    it('should return undefined for expired session', () => {
      const session = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
      // manually expire it
      store['sessions'].set(session.id, { ...session, expiresAt: new Date(Date.now() - 1000) })
      expect(store.findByToken('token-1')).toBeUndefined()
    })
  })

  describe('findByRefreshToken', () => {
    it('should find session by refresh token', () => {
      const session = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
      const found = store.findByRefreshToken('refresh-1')
      expect(found?.id).toBe(session.id)
    })

    it('should return undefined for expired refresh token', () => {
      const session = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
      store['sessions'].set(session.id, { ...session, refreshExpiresAt: new Date(Date.now() - 1000) })
      expect(store.findByRefreshToken('refresh-1')).toBeUndefined()
    })
  })

  describe('refresh', () => {
    it('should rotate tokens', () => {
      const session = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
      const refreshed = store.refresh(session.id, 'token-2', 'refresh-2')
      expect(refreshed?.token).toBe('token-2')
      expect(refreshed?.refreshToken).toBe('refresh-2')
      // old token no longer works
      expect(store.findByToken('token-1')).toBeUndefined()
      expect(store.findByToken('token-2')).toBeDefined()
    })

    it('should return undefined for unknown session', () => {
      expect(store.refresh('unknown', 'token-2', 'refresh-2')).toBeUndefined()
    })
  })

  describe('generation', () => {
    it('should start at generation 0', () => {
      const session = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
      expect(session.generation).toBe(0)
      expect(store.getGeneration(session.id)).toBe(0)
    })

    it('should increment generation on refresh', () => {
      const session = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
      const refreshed = store.refresh(session.id, 'token-2', 'refresh-2')
      expect(refreshed?.generation).toBe(1)
      expect(store.getGeneration(session.id)).toBe(1)
    })

    it('should increment generation on multiple refreshes', () => {
      const session = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
      store.refresh(session.id, 'token-2', 'refresh-2')
      const refreshed2 = store.refresh(session.id, 'token-3', 'refresh-3')
      expect(refreshed2?.generation).toBe(2)
    })

    it('should return undefined for unknown session from getGeneration', () => {
      expect(store.getGeneration('unknown')).toBeUndefined()
    })
  })

  describe('revoke', () => {
    it('should remove session', () => {
      const session = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
      store.revoke(session.id)
      expect(store.findByToken('token-1')).toBeUndefined()
    })
  })

  describe('revokeAllForUser', () => {
    it('should revoke all sessions for a user', () => {
      store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
      store.create('user-1', 'token-2', 'refresh-2', '127.0.0.1', 'UA')
      store.create('user-2', 'token-3', 'refresh-3', '127.0.0.1', 'UA')
      store.revokeAllForUser('user-1')
      expect(store.findByToken('token-1')).toBeUndefined()
      expect(store.findByToken('token-2')).toBeUndefined()
      expect(store.findByToken('token-3')).toBeDefined()
    })
  })

  describe('max sessions', () => {
    it('should evict oldest session when exceeding max 5', () => {
      const sessions = []
      for (let i = 0; i < 5; i++) {
        sessions.push(store.create('user-1', `token-${i}`, `refresh-${i}`, '127.0.0.1', 'UA'))
      }
      // 6th session should evict the oldest
      store.create('user-1', 'token-5', 'refresh-5', '127.0.0.1', 'UA')
      expect(store.findByToken('token-0')).toBeUndefined() // oldest evicted
      expect(store.findByToken('token-5')).toBeDefined() // newest present
    })
  })

  describe('cleanup', () => {
    it('should remove expired sessions', () => {
      const session = store.create('user-1', 'token-1', 'refresh-1', '127.0.0.1', 'UA')
      store['sessions'].set(session.id, { ...session, expiresAt: new Date(Date.now() - 1000), refreshExpiresAt: new Date(Date.now() - 1000) })
      store.cleanup()
      expect(store['sessions'].has(session.id)).toBe(false)
    })
  })
})
