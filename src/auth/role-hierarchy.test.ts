import { describe, expect, it } from 'vitest'

import { hasPermission } from './role-hierarchy'

describe('hasPermission', () => {
  describe('admin role', () => {
    it('admin can access admin resources', () => {
      expect(hasPermission('admin', 'admin')).toBe(true)
    })

    it('admin can access editor resources', () => {
      expect(hasPermission('admin', 'editor')).toBe(true)
    })

    it('admin can access viewer resources', () => {
      expect(hasPermission('admin', 'viewer')).toBe(true)
    })

    it('admin can access guest resources', () => {
      expect(hasPermission('admin', 'guest')).toBe(true)
    })
  })

  describe('editor role', () => {
    it('editor cannot access admin resources', () => {
      expect(hasPermission('editor', 'admin')).toBe(false)
    })

    it('editor can access editor resources', () => {
      expect(hasPermission('editor', 'editor')).toBe(true)
    })

    it('editor can access viewer resources', () => {
      expect(hasPermission('editor', 'viewer')).toBe(true)
    })

    it('editor can access guest resources', () => {
      expect(hasPermission('editor', 'guest')).toBe(true)
    })
  })

  describe('viewer role', () => {
    it('viewer cannot access admin resources', () => {
      expect(hasPermission('viewer', 'admin')).toBe(false)
    })

    it('viewer cannot access editor resources', () => {
      expect(hasPermission('viewer', 'editor')).toBe(false)
    })

    it('viewer can access viewer resources', () => {
      expect(hasPermission('viewer', 'viewer')).toBe(true)
    })

    it('viewer can access guest resources', () => {
      expect(hasPermission('viewer', 'guest')).toBe(true)
    })
  })

  describe('guest role', () => {
    it('guest cannot access admin resources', () => {
      expect(hasPermission('guest', 'admin')).toBe(false)
    })

    it('guest cannot access editor resources', () => {
      expect(hasPermission('guest', 'editor')).toBe(false)
    })

    it('guest cannot access viewer resources', () => {
      expect(hasPermission('guest', 'viewer')).toBe(false)
    })

    it('guest can access guest resources', () => {
      expect(hasPermission('guest', 'guest')).toBe(true)
    })
  })

  describe('unknown roles', () => {
    it('returns false for unknown user role', () => {
      expect(hasPermission('unknown', 'admin')).toBe(false)
    })

    it('returns false for unknown required role', () => {
      expect(hasPermission('admin', 'unknown')).toBe(false)
    })

    it('returns false for both unknown roles', () => {
      expect(hasPermission('unknown', 'also_unknown')).toBe(false)
    })
  })
})