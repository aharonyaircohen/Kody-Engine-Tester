import { describe, it, expect, beforeEach } from 'vitest'
import { refresh } from './refresh'
import { UserStore } from '../../auth/user-store'
import { SessionStore } from '../../auth/session-store'
import { JwtService } from '../../auth/jwt-service'
import { login } from './login'

describe('refresh', () => {
  let userStore: UserStore
  let sessionStore: SessionStore
  let jwtService: JwtService

  beforeEach(async () => {
    userStore = new UserStore()
    await userStore.ready
    sessionStore = new SessionStore()
    jwtService = new JwtService('test-secret')
  })

  async function loginUser() {
    return login('user@example.com', 'UserPass1!', '127.0.0.1', 'UA', userStore, sessionStore, jwtService)
  }

  it('should return new token pair on valid refresh token', async () => {
    const { refreshToken } = await loginUser()
    const result = await refresh(refreshToken, sessionStore, jwtService)
    expect(result.accessToken).toBeDefined()
    expect(result.refreshToken).toBeDefined()
  })

  it('should return 401 for invalid refresh token', async () => {
    await expect(refresh('invalid-token', sessionStore, jwtService))
      .rejects.toMatchObject({ status: 401 })
  })

  it('should return 400 for missing refresh token', async () => {
    await expect(refresh('', sessionStore, jwtService))
      .rejects.toMatchObject({ status: 400 })
  })

  it('should invalidate old refresh token after rotation', async () => {
    const { refreshToken } = await loginUser()
    await refresh(refreshToken, sessionStore, jwtService)
    // Using old refresh token again should fail
    await expect(refresh(refreshToken, sessionStore, jwtService))
      .rejects.toMatchObject({ status: 401 })
  })
})
