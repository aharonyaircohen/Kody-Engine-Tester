import { describe, it, expect, beforeEach, vi } from 'vitest'
import { login } from './login'
import { AuthService } from '../../auth/auth-service'
import { JwtService } from '../../auth/jwt-service'

vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn(() => mockPayload),
}))

const mockPayload = { find: vi.fn(), update: vi.fn() }
const mockJwtService = new JwtService('test-secret')
const mockAuthService = new AuthService(mockPayload as any, mockJwtService)

describe('login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return tokens and user on successful login', async () => {
    vi.spyOn(mockAuthService, 'login').mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: '1', email: 'admin@example.com', role: 'admin' },
    })
    const result = await login('admin@example.com', 'AdminPass1!', '127.0.0.1', 'TestAgent', mockAuthService)
    expect(result.accessToken).toBe('access-token')
    expect(result.user.email).toBe('admin@example.com')
  })

  it('should return 401 for unknown email', async () => {
    vi.spyOn(mockAuthService, 'login').mockRejectedValue({
      message: 'Invalid credentials',
      status: 401,
    })
    await expect(login('unknown@example.com', 'pass', '127.0.0.1', 'UA', mockAuthService))
      .rejects.toMatchObject({ status: 401 })
  })

  it('should return 401 for wrong password', async () => {
    vi.spyOn(mockAuthService, 'login').mockRejectedValue({
      message: 'Invalid credentials',
      status: 401,
    })
    await expect(login('admin@example.com', 'wrongpass', '127.0.0.1', 'UA', mockAuthService))
      .rejects.toMatchObject({ status: 401 })
  })

  it('should return 400 for missing credentials', async () => {
    await expect(login('', '', '127.0.0.1', 'UA', mockAuthService))
      .rejects.toMatchObject({ status: 400 })
  })
})
