import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Use vi.hoisted to avoid hoisting issues with vi.mock
const { userStore, sessionStore, jwtService } = vi.hoisted(() => {
  const mockFindByEmail = vi.fn()
  const mockFindById = vi.fn()
  const mockIsLocked = vi.fn()
  const mockVerifyPassword = vi.fn()
  const mockRecordFailedLogin = vi.fn()
  const mockResetFailedAttempts = vi.fn()
  const mockUpdate = vi.fn()

  const mockUserStore = {
    findByEmail: mockFindByEmail,
    findById: mockFindById,
    isLocked: mockIsLocked,
    verifyPassword: mockVerifyPassword,
    recordFailedLogin: mockRecordFailedLogin,
    resetFailedAttempts: mockResetFailedAttempts,
    update: mockUpdate,
  }

  const mockCreateSession = vi.fn(() => ({ id: 'session-123' }))
  const mockRefreshSession = vi.fn()
  const mockSessionStore = {
    create: mockCreateSession,
    refresh: mockRefreshSession,
  }

  const mockSignAccessToken = vi.fn(() => Promise.resolve('mock-access-token'))
  const mockSignRefreshToken = vi.fn(() => Promise.resolve('mock-refresh-token'))
  const mockJwtService = {
    signAccessToken: mockSignAccessToken,
    signRefreshToken: mockSignRefreshToken,
  }

  return {
    userStore: mockUserStore,
    sessionStore: mockSessionStore,
    jwtService: mockJwtService,
    mockFindByEmail,
    mockFindById,
    mockIsLocked,
    mockVerifyPassword,
    mockRecordFailedLogin,
    mockResetFailedAttempts,
    mockUpdate,
    mockCreateSession,
    mockRefreshSession,
    mockSignAccessToken,
    mockSignRefreshToken,
  }
})

vi.mock('@/auth', () => ({
  userStore,
  sessionStore,
  jwtService,
}))

// Import POST after mocking
import { POST } from './route'

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 200 and JWT tokens on successful login', async () => {
    userStore.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'admin@example.com',
      role: 'admin',
      isActive: true,
      passwordHash: 'hash',
      salt: 'salt',
      failedLoginAttempts: 0,
    })
    userStore.verifyPassword.mockResolvedValue(true)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'AdminPass1!' }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.accessToken).toBeDefined()
    expect(body.refreshToken).toBeDefined()
    expect(body.user.email).toBe('admin@example.com')
    expect(body.user.role).toBe('admin')
  })

  it('should return 401 for unknown email', async () => {
    userStore.findByEmail.mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'unknown@example.com', password: 'pass' }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('Invalid credentials')
  })

  it('should return 401 for wrong password', async () => {
    userStore.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'admin@example.com',
      role: 'admin',
      isActive: true,
      passwordHash: 'hash',
      salt: 'salt',
      failedLoginAttempts: 0,
    })
    userStore.verifyPassword.mockResolvedValue(false)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'wrongpass' }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('Invalid credentials')
  })

  it('should return 400 for missing credentials', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
  })

  it('should return 403 for inactive user', async () => {
    userStore.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'inactive@example.com',
      role: 'student',
      isActive: false,
      passwordHash: 'hash',
      salt: 'salt',
      failedLoginAttempts: 0,
    })

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'inactive@example.com', password: 'InactivePass1!' }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.error).toBe('Account is inactive')
  })

  it('should return 423 for locked account', async () => {
    userStore.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      role: 'user',
      isActive: true,
      passwordHash: 'hash',
      salt: 'salt',
      failedLoginAttempts: 0,
    })
    userStore.isLocked.mockReturnValue(true)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com', password: 'UserPass1!' }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(423)
    expect(body.error).toBe('Account is locked. Please try again later.')
  })
})