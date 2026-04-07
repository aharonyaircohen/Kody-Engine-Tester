import { describe, it, expect, beforeEach } from 'vitest'
import { login } from './login'
import { UserStore } from '../../auth/user-store'
import { JwtService } from '../../auth/jwt-service'

describe('login', () => {
  let userStore: UserStore
  let jwtService: JwtService

  beforeEach(async () => {
    userStore = new UserStore()
    await userStore.ready
    jwtService = new JwtService('test-secret')
  })

  it('should return tokens and user on successful login', async () => {
    const result = await login('admin@example.com', 'AdminPass1!', '127.0.0.1', 'TestAgent', userStore, jwtService)
    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
    expect(result.user.email).toBe('admin@example.com')
    expect(result.user.role).toBe('admin')
    expect(result.user.id).toBeDefined()
  })

  it('should return 401 for unknown email', async () => {
    await expect(login('unknown@example.com', 'pass', '127.0.0.1', 'UA', userStore, jwtService))
      .rejects.toMatchObject({ status: 401 })
  })

  it('should return 401 for wrong password', async () => {
    await expect(login('admin@example.com', 'wrongpass', '127.0.0.1', 'UA', userStore, jwtService))
      .rejects.toMatchObject({ status: 401 })
  })

  it('should return 400 for missing credentials', async () => {
    await expect(login('', '', '127.0.0.1', 'UA', userStore, jwtService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should return 403 for inactive user', async () => {
    await expect(login('inactive@example.com', 'InactivePass1!', '127.0.0.1', 'UA', userStore, jwtService))
      .rejects.toMatchObject({ status: 403 })
  })

  it('should return 423 for locked account', async () => {
    const user = await userStore.findByEmail('user@example.com')
    for (let i = 0; i < 5; i++) {
      await userStore.recordFailedLogin(user!.id)
    }
    await expect(login('user@example.com', 'UserPass1!', '127.0.0.1', 'UA', userStore, jwtService))
      .rejects.toMatchObject({ status: 423 })
  })

  it('should increment failed attempts on wrong password', async () => {
    const user = await userStore.findByEmail('user@example.com')
    try {
      await login('user@example.com', 'wrong', '127.0.0.1', 'UA', userStore, jwtService)
    } catch {}
    const updated = await userStore.findById(user!.id)
    expect(updated?.failedLoginAttempts).toBe(1)
  })
})