import { describe, expect, it } from 'vitest'

import { hasPermission, ROLE_HIERARCHY } from './role-hierarchy'

describe('ROLE_HIERARCHY', () => {
  it('has admin at highest level', () => {
    expect(ROLE_HIERARCHY.admin).toBe(3)
  })

  it('has editor above viewer', () => {
    expect(ROLE_HIERARCHY.editor).toBeGreaterThan(ROLE_HIERARCHY.viewer)
  })

  it('has viewer above guest', () => {
    expect(ROLE_HIERARCHY.viewer).toBeGreaterThan(ROLE_HIERARCHY.guest)
  })

  it('has guest at lowest level', () => {
    expect(ROLE_HIERARCHY.guest).toBe(0)
  })
})

describe('hasPermission', () => {
  describe('exact role match', () => {
    it('returns true when user has exact required role', () => {
      expect(hasPermission('admin', 'admin')).toBe(true)
      expect(hasPermission('editor', 'editor')).toBe(true)
      expect(hasPermission('viewer', 'viewer')).toBe(true)
      expect(hasPermission('guest', 'guest')).toBe(true)
    })
  })

  describe('hierarchical inheritance', () => {
    it('admin can perform editor actions', () => {
      expect(hasPermission('admin', 'editor')).toBe(true)
    })

    it('admin can perform viewer actions', () => {
      expect(hasPermission('admin', 'viewer')).toBe(true)
    })

    it('admin can perform guest actions', () => {
      expect(hasPermission('admin', 'guest')).toBe(true)
    })

    it('editor can perform viewer actions', () => {
      expect(hasPermission('editor', 'viewer')).toBe(true)
    })

    it('editor can perform guest actions', () => {
      expect(hasPermission('editor', 'guest')).toBe(true)
    })

    it('viewer can perform guest actions', () => {
      expect(hasPermission('viewer', 'guest')).toBe(true)
    })
  })

  describe('insufficient permissions', () => {
    it('editor cannot perform admin actions', () => {
      expect(hasPermission('editor', 'admin')).toBe(false)
    })

    it('viewer cannot perform editor actions', () => {
      expect(hasPermission('viewer', 'editor')).toBe(false)
    })

    it('viewer cannot perform admin actions', () => {
      expect(hasPermission('viewer', 'admin')).toBe(false)
    })

    it('guest cannot perform viewer actions', () => {
      expect(hasPermission('guest', 'viewer')).toBe(false)
    })

    it('guest cannot perform editor actions', () => {
      expect(hasPermission('guest', 'editor')).toBe(false)
    })

    it('guest cannot perform admin actions', () => {
      expect(hasPermission('guest', 'admin')).toBe(false)
    })
  })

  describe('unknown roles', () => {
    it('returns false for unknown user role', () => {
      expect(hasPermission('unknown', 'viewer')).toBe(false)
    })

    it('returns false for unknown required role', () => {
      expect(hasPermission('admin', 'unknown')).toBe(false)
    })

    it('returns false for both unknown roles', () => {
      expect(hasPermission('unknown', 'also_unknown')).toBe(false)
    })

    it('returns false for empty string user role', () => {
      expect(hasPermission('', 'viewer')).toBe(false)
    })

    it('returns false for empty string required role', () => {
      expect(hasPermission('admin', '')).toBe(false)
    })
  })
})
