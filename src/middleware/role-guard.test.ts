import { describe, it, expect } from 'vitest'
import { requireRole } from './role-guard'
import type { AuthenticatedUser } from '../auth/auth-service'
import type { RbacRole } from '../auth/auth-service'

const makeContext = (role: RbacRole) => ({
  user: { id: '1', email: 'test@example.com', role, isActive: true } as AuthenticatedUser,
})

describe('requireRole', () => {
  it('should allow user with required role', () => {
    const guard = requireRole('admin')
    const result = guard(makeContext('admin'))
    expect(result).toBeUndefined()
  })

  it('should allow user with one of multiple allowed roles', () => {
    const guard = requireRole('admin', 'editor')
    expect(guard(makeContext('admin'))).toBeUndefined()
    expect(guard(makeContext('editor'))).toBeUndefined()
  })

  it('should allow admin to access editor-protected routes (hierarchical)', () => {
    const guard = requireRole('editor')
    const result = guard(makeContext('admin'))
    expect(result).toBeUndefined()
  })

  it('should allow editor to access viewer-protected routes (hierarchical)', () => {
    const guard = requireRole('viewer')
    const result = guard(makeContext('editor'))
    expect(result).toBeUndefined()
  })

  it('should allow admin to access viewer-protected routes (hierarchical)', () => {
    const guard = requireRole('viewer')
    const result = guard(makeContext('admin'))
    expect(result).toBeUndefined()
  })

  it('should return 403 when user lacks required role', () => {
    const guard = requireRole('admin')
    const result = guard(makeContext('viewer'))
    expect(result?.status).toBe(403)
    expect(result?.error).toContain('admin')
  })

  it('should return 401 when no user in context', () => {
    const guard = requireRole('admin')
    const result = guard({})
    expect(result?.status).toBe(401)
    expect(result?.error).toBe('Authentication required')
  })

  it('should return 401 when user exists but has no role', () => {
    const guard = requireRole('admin')
    const result = guard({ user: { id: '1', email: 'test@test.com' } as AuthenticatedUser })
    expect(result?.status).toBe(401)
    expect(result?.error).toBe('User role not configured')
  })

  it('should include descriptive error message', () => {
    const guard = requireRole('admin', 'editor')
    const result = guard(makeContext('viewer'))
    expect(result?.error).toContain('admin')
    expect(result?.error).toContain('editor')
  })
})
