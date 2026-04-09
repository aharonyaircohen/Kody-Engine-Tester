import { describe, it, expect } from 'vitest'
import { hasPermission } from './role-hierarchy'

describe('hasPermission', () => {
  describe('hierarchy: admin > editor > viewer > guest', () => {
    it('admin can access any role', () => {
      expect(hasPermission('admin', 'admin')).toBe(true)
      expect(hasPermission('admin', 'editor')).toBe(true)
      expect(hasPermission('admin', 'viewer')).toBe(true)
      expect(hasPermission('admin', 'guest')).toBe(true)
    })

    it('editor can access editor, viewer, guest', () => {
      expect(hasPermission('editor', 'editor')).toBe(true)
      expect(hasPermission('editor', 'viewer')).toBe(true)
      expect(hasPermission('editor', 'guest')).toBe(true)
      expect(hasPermission('editor', 'admin')).toBe(false)
    })

    it('viewer can access viewer, guest', () => {
      expect(hasPermission('viewer', 'viewer')).toBe(true)
      expect(hasPermission('viewer', 'guest')).toBe(true)
      expect(hasPermission('viewer', 'editor')).toBe(false)
      expect(hasPermission('viewer', 'admin')).toBe(false)
    })

    it('guest can only access guest', () => {
      expect(hasPermission('guest', 'guest')).toBe(true)
      expect(hasPermission('guest', 'viewer')).toBe(false)
      expect(hasPermission('guest', 'editor')).toBe(false)
      expect(hasPermission('guest', 'admin')).toBe(false)
    })
  })

  describe('invalid roles', () => {
    it('returns false for unknown user role', () => {
      expect(hasPermission('unknown', 'guest')).toBe(false)
      expect(hasPermission('unknown', 'viewer')).toBe(false)
    })

    it('returns false for unknown required role', () => {
      expect(hasPermission('admin', 'unknown')).toBe(false)
      expect(hasPermission('editor', 'unknown')).toBe(false)
    })

    it('returns false when both roles are unknown', () => {
      expect(hasPermission('unknown', 'unknown')).toBe(false)
    })
  })
})
