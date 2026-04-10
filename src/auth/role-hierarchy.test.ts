import { describe, it, expect } from 'vitest'
import { hasPermission, ROLE_HIERARCHY } from './role-hierarchy'

describe('role-hierarchy', () => {
  describe('hasPermission', () => {
    describe('admin role', () => {
      it('should allow admin to access admin resources', () => {
        expect(hasPermission('admin', 'admin')).toBe(true)
      })

      it('should allow admin to access editor resources', () => {
        expect(hasPermission('admin', 'editor')).toBe(true)
      })

      it('should allow admin to access viewer resources', () => {
        expect(hasPermission('admin', 'viewer')).toBe(true)
      })

      it('should allow admin to access guest resources', () => {
        expect(hasPermission('admin', 'guest')).toBe(true)
      })
    })

    describe('editor role', () => {
      it('should deny editor from accessing admin resources', () => {
        expect(hasPermission('editor', 'admin')).toBe(false)
      })

      it('should allow editor to access editor resources', () => {
        expect(hasPermission('editor', 'editor')).toBe(true)
      })

      it('should allow editor to access viewer resources', () => {
        expect(hasPermission('editor', 'viewer')).toBe(true)
      })

      it('should allow editor to access guest resources', () => {
        expect(hasPermission('editor', 'guest')).toBe(true)
      })
    })

    describe('viewer role', () => {
      it('should deny viewer from accessing admin resources', () => {
        expect(hasPermission('viewer', 'admin')).toBe(false)
      })

      it('should deny viewer from accessing editor resources', () => {
        expect(hasPermission('viewer', 'editor')).toBe(false)
      })

      it('should allow viewer to access viewer resources', () => {
        expect(hasPermission('viewer', 'viewer')).toBe(true)
      })

      it('should allow viewer to access guest resources', () => {
        expect(hasPermission('viewer', 'guest')).toBe(true)
      })
    })

    describe('guest role', () => {
      it('should deny guest from accessing admin resources', () => {
        expect(hasPermission('guest', 'admin')).toBe(false)
      })

      it('should deny guest from accessing editor resources', () => {
        expect(hasPermission('guest', 'editor')).toBe(false)
      })

      it('should deny guest from accessing viewer resources', () => {
        expect(hasPermission('guest', 'viewer')).toBe(false)
      })

      it('should allow guest to access guest resources', () => {
        expect(hasPermission('guest', 'guest')).toBe(true)
      })
    })

    describe('invalid roles', () => {
      it('should return false for unknown user role', () => {
        expect(hasPermission('unknown', 'admin')).toBe(false)
      })

      it('should return false for unknown required role', () => {
        expect(hasPermission('admin', 'unknown')).toBe(false)
      })

      it('should return false for both invalid roles', () => {
        expect(hasPermission('unknown', 'also_unknown')).toBe(false)
      })
    })
  })

  describe('ROLE_HIERARCHY', () => {
    it('should have admin at the highest level', () => {
      expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.editor)
      expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.viewer)
      expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.guest)
    })

    it('should have editor above viewer and guest', () => {
      expect(ROLE_HIERARCHY.editor).toBeGreaterThan(ROLE_HIERARCHY.viewer)
      expect(ROLE_HIERARCHY.editor).toBeGreaterThan(ROLE_HIERARCHY.guest)
    })

    it('should have viewer above guest', () => {
      expect(ROLE_HIERARCHY.viewer).toBeGreaterThan(ROLE_HIERARCHY.guest)
    })

    it('should have guest at the lowest level', () => {
      expect(ROLE_HIERARCHY.guest).toBe(0)
    })
  })
})