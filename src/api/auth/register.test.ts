import { describe, it, expect, beforeEach } from 'vitest'
import { register } from './register'
import { UserStore } from '../../auth/user-store'
import { SessionStore } from '../../auth/session-store'
import { JwtService } from '../../auth/jwt-service'

describe('register', () => {
  let userStore: UserStore
  let sessionStore: SessionStore
  let jwtService: JwtService

  beforeEach(async () => {
    userStore = new UserStore()
    await userStore.ready
    sessionStore = new SessionStore()
    jwtService = new JwtService('test-secret')
  })

  it('should register and return tokens + user', async () => {
    const result = await register('new@example.com', 'NewPass1!', 'NewPass1!', '127.0.0.1', 'UA', userStore, sessionStore, jwtService)
    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
    expect(result.user.email).toBe('new@example.com')
    expect(result.user.role).toBe('viewer')
  })

  it('should return 400 for invalid email', async () => {
    await expect(register('not-an-email', 'NewPass1!', 'NewPass1!', '127.0.0.1', 'UA', userStore, sessionStore, jwtService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should return 400 for mismatched passwords', async () => {
    await expect(register('new@example.com', 'NewPass1!', 'Different1!', '127.0.0.1', 'UA', userStore, sessionStore, jwtService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should return 400 for weak password - too short', async () => {
    await expect(register('new@example.com', 'Ab1!', 'Ab1!', '127.0.0.1', 'UA', userStore, sessionStore, jwtService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should return 400 for weak password - no uppercase', async () => {
    await expect(register('new@example.com', 'password1!', 'password1!', '127.0.0.1', 'UA', userStore, sessionStore, jwtService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should return 400 for weak password - no number', async () => {
    await expect(register('new@example.com', 'Password!', 'Password!', '127.0.0.1', 'UA', userStore, sessionStore, jwtService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should return 400 for weak password - no special char', async () => {
    await expect(register('new@example.com', 'Password1', 'Password1', '127.0.0.1', 'UA', userStore, sessionStore, jwtService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should return 409 for duplicate email', async () => {
    await expect(register('admin@example.com', 'NewPass1!', 'NewPass1!', '127.0.0.1', 'UA', userStore, sessionStore, jwtService))
      .rejects.toMatchObject({ status: 409 })
  })

  it('should return 400 for missing fields', async () => {
    await expect(register('', '', '', '127.0.0.1', 'UA', userStore, sessionStore, jwtService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should assign viewer role', async () => {
    const result = await register('new@example.com', 'NewPass1!', 'NewPass1!', '127.0.0.1', 'UA', userStore, sessionStore, jwtService)
    expect(result.user.role).toBe('viewer')
  })
})
