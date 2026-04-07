import { describe, expect, it } from 'vitest'

import { hasPermission, ROLE_HIERARCHY_LEVELS } from './role-hierarchy'

describe('hasPermission', () => {
  describe('same role permissions', () => {
    it('admin has permission for admin', () => {
      expect(hasPermission('admin', 'admin')).toBe(true)
    })

    it('editor has permission for editor', () => {
      expect(hasPermission('editor', 'editor')).toBe(true)
    })

    it('viewer has permission for viewer', () => {
      expect(hasPermission('viewer', 'viewer')).toBe(true)
    })

    it('guest has permission for guest', () => {
      expect(hasPermission('guest', 'guest')).toBe(true)
    })
  })

  describe('higher role permissions (hierarchical inheritance)', () => {
    it('admin has permission for editor', () => {
      expect(hasPermission('admin', 'editor')).toBe(true)
    })

    it('admin has permission for viewer', () => {
      expect(hasPermission('admin', 'viewer')).toBe(true)
    })

    it('admin has permission for guest', () => {
      expect(hasPermission('admin', 'guest')).toBe(true)
    })

    it('editor has permission for viewer', () => {
      expect(hasPermission('editor', 'viewer')).toBe(true)
    })

    it('editor has permission for guest', () => {
      expect(hasPermission('editor', 'guest')).toBe(true)
    })

    it('viewer has permission for guest', () => {
      expect(hasPermission('viewer', 'guest')).toBe(true)
    })
  })

  describe('lower role permissions (denied)', () => {
    it('editor does not have permission for admin', () => {
      expect(hasPermission('editor', 'admin')).toBe(false)
    })

    it('viewer does not have permission for admin', () => {
      expect(hasPermission('viewer', 'admin')).toBe(false)
    })

    it('viewer does not have permission for editor', () => {
      expect(hasPermission('viewer', 'editor')).toBe(false)
    })

    it('guest does not have permission for admin', () => {
      expect(hasPermission('guest', 'admin')).toBe(false)
    })

    it('guest does not have permission for editor', () => {
      expect(hasPermission('guest', 'editor')).toBe(false)
    })

    it('guest does not have permission for viewer', () => {
      expect(hasPermission('guest', 'viewer')).toBe(false)
    })
  })

  describe('invalid roles', () => {
    it('returns false when user role is not in hierarchy', () => {
      expect(hasPermission('invalid', 'admin')).toBe(false)
    })

    it('returns false when required role is not in hierarchy', () => {
      expect(hasPermission('admin', 'invalid')).toBe(false)
    })

    it('returns false when both roles are not in hierarchy', () => {
      expect(hasPermission('invalid', 'also_invalid')).toBe(false)
    })

    it('returns false for empty string user role', () => {
      expect(hasPermission('', 'admin')).toBe(false)
    })

    it('returns false for empty string required role', () => {
      expect(hasPermission('admin', '')).toBe(false)
    })
  })

  describe('ROLE_HIERARCHY_LEVELS', () => {
    it('has correct hierarchy levels', () => {
      expect(ROLE_HIERARCHY_LEVELS.admin).toBe(3)
      expect(ROLE_HIERARCHY_LEVELS.editor).toBe(2)
      expect(ROLE_HIERARCHY_LEVELS.viewer).toBe(1)
      expect(ROLE_HIERARCHY_LEVELS.guest).toBe(0)
    })

    it('admin has highest level', () => {
      expect(ROLE_HIERARCHY_LEVELS.admin).toBeGreaterThan(ROLE_HIERARCHY_LEVELS.editor)
      expect(ROLE_HIERARCHY_LEVELS.admin).toBeGreaterThan(ROLE_HIERARCHY_LEVELS.viewer)
      expect(ROLE_HIERARCHY_LEVELS.admin).toBeGreaterThan(ROLE_HIERARCHY_LEVELS.guest)
    })

    it('guest has lowest level', () => {
      expect(ROLE_HIERARCHY_LEVELS.guest).toBeLessThan(ROLE_HIERARCHY_LEVELS.viewer)
      expect(ROLE_HIERARCHY_LEVELS.guest).toBeLessThan(ROLE_HIERARCHY_LEVELS.editor)
      expect(ROLE_HIERARCHY_LEVELS.guest).toBeLessThan(ROLE_HIERARCHY_LEVELS.admin)
    })
  })
})