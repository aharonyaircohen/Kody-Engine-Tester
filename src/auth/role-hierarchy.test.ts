import { describe, expect, it } from 'vitest'

import { hasPermission } from './role-hierarchy'

describe('hasPermission', () => {
  it('returns true when user role matches required role exactly', () => {
    expect(hasPermission('admin', 'admin')).toBe(true)
    expect(hasPermission('editor', 'editor')).toBe(true)
    expect(hasPermission('viewer', 'viewer')).toBe(true)
    expect(hasPermission('guest', 'guest')).toBe(true)
  })

  it('returns true when user role is higher than required role', () => {
    expect(hasPermission('admin', 'editor')).toBe(true)
    expect(hasPermission('admin', 'viewer')).toBe(true)
    expect(hasPermission('admin', 'guest')).toBe(true)
    expect(hasPermission('editor', 'viewer')).toBe(true)
    expect(hasPermission('editor', 'guest')).toBe(true)
    expect(hasPermission('viewer', 'guest')).toBe(true)
  })

  it('returns false when user role is lower than required role', () => {
    expect(hasPermission('viewer', 'admin')).toBe(false)
    expect(hasPermission('guest', 'admin')).toBe(false)
    expect(hasPermission('guest', 'editor')).toBe(false)
    expect(hasPermission('guest', 'viewer')).toBe(false)
    expect(hasPermission('editor', 'admin')).toBe(false)
    expect(hasPermission('viewer', 'editor')).toBe(false)
  })

  it('returns false when user role is unknown', () => {
    expect(hasPermission('unknown', 'admin')).toBe(false)
    expect(hasPermission('unknown', 'viewer')).toBe(false)
    expect(hasPermission('superadmin', 'admin')).toBe(false)
  })

  it('returns true when required role is unknown but user has any known role', () => {
    expect(hasPermission('admin', 'unknown')).toBe(true)
    expect(hasPermission('viewer', 'unknown')).toBe(true)
    expect(hasPermission('guest', 'unknown')).toBe(true)
  })

  it('hierarchical inheritance: admin has all permissions', () => {
    expect(hasPermission('admin', 'admin')).toBe(true)
    expect(hasPermission('admin', 'editor')).toBe(true)
    expect(hasPermission('admin', 'viewer')).toBe(true)
    expect(hasPermission('admin', 'guest')).toBe(true)
  })

  it('hierarchical inheritance: editor inherits viewer and guest', () => {
    expect(hasPermission('editor', 'viewer')).toBe(true)
    expect(hasPermission('editor', 'guest')).toBe(true)
    expect(hasPermission('editor', 'admin')).toBe(false)
  })

  it('hierarchical inheritance: viewer inherits guest only', () => {
    expect(hasPermission('viewer', 'guest')).toBe(true)
    expect(hasPermission('viewer', 'editor')).toBe(false)
    expect(hasPermission('viewer', 'admin')).toBe(false)
  })

  it('hierarchical inheritance: guest has no inherited permissions', () => {
    expect(hasPermission('guest', 'guest')).toBe(true)
    expect(hasPermission('guest', 'viewer')).toBe(false)
    expect(hasPermission('guest', 'editor')).toBe(false)
    expect(hasPermission('guest', 'admin')).toBe(false)
  })
})