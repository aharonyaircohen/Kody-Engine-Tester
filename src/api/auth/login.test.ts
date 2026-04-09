import { describe, it, expect, beforeEach, vi } from 'vitest'
import { login } from './login'
import type { AuthService } from '../../auth/auth-service'

describe('login', () => {
  let mockAuthService: AuthService

  beforeEach(() => {
    mockAuthService = {
      login: vi.fn(),
      refresh: vi.fn(),
      verifyAccessToken: vi.fn(),
      logout: vi.fn(),
    } as unknown as AuthService
  })

  it('should return tokens and user on successful login', async () => {
    const mockResult = {
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-456',
      user: {
        id: '1',
        email: 'admin@example.com',
        role: 'admin' as const,
      },
    }
    mockAuthService.login = vi.fn().mockResolvedValue(mockResult)

    const result = await login('admin@example.com', 'AdminPass1!', '127.0.0.1', 'TestAgent', mockAuthService)

    expect(result.accessToken).toBe('access-token-123')
    expect(result.refreshToken).toBe('refresh-token-456')
    expect(result.user.email).toBe('admin@example.com')
    expect(result.user.role).toBe('admin')
    expect(result.user.id).toBe('1')
  })

  it('should propagate error from AuthService.login for unknown email', async () => {
    const error = new Error('Invalid credentials') as Error & { status: number }
    error.status = 401
    mockAuthService.login = vi.fn().mockRejectedValue(error)

    await expect(login('unknown@example.com', 'pass', '127.0.0.1', 'UA', mockAuthService))
      .rejects.toMatchObject({ status: 401 })
  })

  it('should propagate error from AuthService.login for wrong password', async () => {
    const error = new Error('Invalid credentials') as Error & { status: number }
    error.status = 401
    mockAuthService.login = vi.fn().mockRejectedValue(error)

    await expect(login('admin@example.com', 'wrongpass', '127.0.0.1', 'UA', mockAuthService))
      .rejects.toMatchObject({ status: 401 })
  })

  it('should propagate error from AuthService.login for missing credentials', async () => {
    const error = new Error('Email and password are required') as Error & { status: number }
    error.status = 400
    mockAuthService.login = vi.fn().mockRejectedValue(error)

    await expect(login('', '', '127.0.0.1', 'UA', mockAuthService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should propagate error from AuthService.login for inactive user', async () => {
    const error = new Error('Account is inactive') as Error & { status: number }
    error.status = 403
    mockAuthService.login = vi.fn().mockRejectedValue(error)

    await expect(login('inactive@example.com', 'InactivePass1!', '127.0.0.1', 'UA', mockAuthService))
      .rejects.toMatchObject({ status: 403 })
  })
})