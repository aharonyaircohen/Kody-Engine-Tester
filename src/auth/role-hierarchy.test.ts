import { describe, it, expect } from 'vitest'
import { hasPermission } from './role-hierarchy'

describe('hasPermission', () => {
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

  it('unknown role cannot access any role', () => {
    expect(hasPermission('unknown', 'admin')).toBe(false)
    expect(hasPermission('unknown', 'guest')).toBe(false)
  })

  it('known role cannot access unknown required role', () => {
    expect(hasPermission('admin', 'unknown')).toBe(false)
  })
})
