import { describe, it, expect, beforeEach, vi } from 'vitest'
import { login } from './login'

// Mock AuthService
const mockLogin = vi.fn()

vi.mock('../../auth/withAuth', () => ({
  getAuthService: vi.fn(() => ({
    login: mockLogin,
  })),
}))

describe('login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return tokens and user on successful login', async () => {
    mockLogin.mockResolvedValue({
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-123',
      user: {
        id: 1,
        email: 'admin@example.com',
        role: 'admin',
      },
    })

    const result = await login('admin@example.com', 'AdminPass1!', '127.0.0.1', 'TestAgent')

    expect(result.accessToken).toBe('access-token-123')
    expect(result.refreshToken).toBe('refresh-token-123')
    expect(result.user.email).toBe('admin@example.com')
    expect(result.user.role).toBe('admin')
    expect(result.user.id).toBe('1')
  })

  it('should propagate errors from AuthService', async () => {
    const error = new Error('Invalid credentials') as Error & { status: number }
    error.status = 401
    mockLogin.mockRejectedValue(error)

    await expect(login('unknown@example.com', 'pass', '127.0.0.1', 'UA')).rejects.toMatchObject({
      status: 401,
    })
  })

  it('should propagate 400 error for missing credentials', async () => {
    const error = new Error('Email is required') as Error & { status: number }
    error.status = 400
    mockLogin.mockRejectedValue(error)

    await expect(login('', '', '127.0.0.1', 'UA')).rejects.toMatchObject({
      status: 400,
    })
  })

  it('should propagate 403 error for inactive user', async () => {
    const error = new Error('Account is inactive') as Error & { status: number }
    error.status = 403
    mockLogin.mockRejectedValue(error)

    await expect(login('inactive@example.com', 'password', '127.0.0.1', 'UA')).rejects.toMatchObject({
      status: 403,
    })
  })
})