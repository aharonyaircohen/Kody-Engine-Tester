import { describe, it, expect } from 'vitest'
import { hasPermission, Role } from './role-hierarchy'

describe('hasPermission', () => {
  describe('valid role hierarchies', () => {
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

    it('editor can access editor resources', () => {
      expect(hasPermission('editor', 'editor')).toBe(true)
    })

    it('editor can access viewer resources', () => {
      expect(hasPermission('editor', 'viewer')).toBe(true)
    })

    it('editor can access guest resources', () => {
      expect(hasPermission('editor', 'guest')).toBe(true)
    })

    it('editor cannot access admin resources', () => {
      expect(hasPermission('editor', 'admin')).toBe(false)
    })

    it('viewer can access viewer resources', () => {
      expect(hasPermission('viewer', 'viewer')).toBe(true)
    })

    it('viewer can access guest resources', () => {
      expect(hasPermission('viewer', 'guest')).toBe(true)
    })

    it('viewer cannot access editor resources', () => {
      expect(hasPermission('viewer', 'editor')).toBe(false)
    })

    it('viewer cannot access admin resources', () => {
      expect(hasPermission('viewer', 'admin')).toBe(false)
    })

    it('guest can access guest resources', () => {
      expect(hasPermission('guest', 'guest')).toBe(true)
    })

    it('guest cannot access viewer resources', () => {
      expect(hasPermission('guest', 'viewer')).toBe(false)
    })

    it('guest cannot access editor resources', () => {
      expect(hasPermission('guest', 'editor')).toBe(false)
    })

    it('guest cannot access admin resources', () => {
      expect(hasPermission('guest', 'admin')).toBe(false)
    })
  })

  describe('invalid roles', () => {
    it('returns false for invalid user role', () => {
      expect(hasPermission('invalid', 'admin')).toBe(false)
    })

    it('returns false for invalid required role', () => {
      expect(hasPermission('admin', 'invalid')).toBe(false)
    })

    it('returns false for both invalid roles', () => {
      expect(hasPermission('invalid', 'also_invalid')).toBe(false)
    })

    it('returns false for empty string user role', () => {
      expect(hasPermission('', 'admin')).toBe(false)
    })

    it('returns false for empty string required role', () => {
      expect(hasPermission('admin', '')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('same role grants access', () => {
      const roles: Role[] = ['admin', 'editor', 'viewer', 'guest']
      for (const role of roles) {
        expect(hasPermission(role, role)).toBe(true)
      }
    })
  })
})