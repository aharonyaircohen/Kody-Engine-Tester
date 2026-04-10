import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login } from './login'
import type { AuthService } from '../../auth/auth-service'
import type { Payload } from 'payload'

describe('login', () => {
  let mockPayload: Payload
  let mockAuthService: AuthService

  beforeEach(() => {
    mockPayload = {
      find: vi.fn(),
      update: vi.fn(),
    } as unknown as Payload

    mockAuthService = {
      login: vi.fn(),
    } as unknown as AuthService
  })

  it('should return tokens and user on successful login', async () => {
    const mockResult = {
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-123',
      user: { id: '1', email: 'admin@example.com', role: 'admin' as const },
    }
    ;(mockAuthService.login as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult)

    const result = await login('admin@example.com', 'AdminPass1!', '127.0.0.1', 'TestAgent', mockPayload, mockAuthService)
    expect(result.accessToken).toBe('access-token-123')
    expect(result.refreshToken).toBe('refresh-token-123')
    expect(result.user.email).toBe('admin@example.com')
    expect(result.user.role).toBe('admin')
    expect(result.user.id).toBe('1')
  })

  it('should return 401 for unknown email', async () => {
    ;(mockAuthService.login as ReturnType<typeof vi.fn>).mockRejectedValue({ status: 401, message: 'Invalid credentials' })

    await expect(login('unknown@example.com', 'pass', '127.0.0.1', 'UA', mockPayload, mockAuthService))
      .rejects.toMatchObject({ status: 401 })
  })

  it('should return 401 for wrong password', async () => {
    ;(mockAuthService.login as ReturnType<typeof vi.fn>).mockRejectedValue({ status: 401, message: 'Invalid credentials' })

    await expect(login('admin@example.com', 'wrongpass', '127.0.0.1', 'UA', mockPayload, mockAuthService))
      .rejects.toMatchObject({ status: 401 })
  })

  it('should return 400 for missing credentials', async () => {
    await expect(login('', '', '127.0.0.1', 'UA', mockPayload, mockAuthService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should return 403 for inactive user', async () => {
    ;(mockAuthService.login as ReturnType<typeof vi.fn>).mockRejectedValue({ status: 403, message: 'Account is inactive' })

    await expect(login('inactive@example.com', 'InactivePass1!', '127.0.0.1', 'UA', mockPayload, mockAuthService))
      .rejects.toMatchObject({ status: 403 })
  })
})
