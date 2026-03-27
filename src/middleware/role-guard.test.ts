import { describe, it, expect } from 'vitest'
import { requireRole } from './role-guard'
import type { User } from '../auth/user-store'

const makeContext = (role: string) => ({
  user: { id: '1', email: 'test@example.com', role, isActive: true } as User,
})

describe('requireRole', () => {
  it('should allow user with required role', () => {
    const guard = requireRole('admin')
    const result = guard(makeContext('admin'))
    expect(result).toBeUndefined()
  })

  it('should allow user with one of multiple allowed roles', () => {
    const guard = requireRole('admin', 'user')
    expect(guard(makeContext('admin'))).toBeUndefined()
    expect(guard(makeContext('user'))).toBeUndefined()
  })

  it('should return 403 when user lacks required role', () => {
    const guard = requireRole('admin')
    const result = guard(makeContext('user'))
    expect(result?.status).toBe(403)
    expect(result?.error).toContain('admin')
  })

  it('should return 401 when no user in context', () => {
    const guard = requireRole('admin')
    const result = guard({})
    expect(result?.status).toBe(401)
  })

  it('should include descriptive error message', () => {
    const guard = requireRole('admin', 'moderator')
    const result = guard(makeContext('user'))
    expect(result?.error).toContain('admin')
    expect(result?.error).toContain('moderator')
  })
})
