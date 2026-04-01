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
    return login('viewer@example.com', 'ViewerPass1!', '127.0.0.1', 'UA', userStore, sessionStore, jwtService)
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

  it('should invalidate old access token after refresh', async () => {
    const { accessToken, refreshToken } = await loginUser()
    const result = await refresh(refreshToken, sessionStore, jwtService)
    // login() already called refresh() internally (to patch sessionId in tokens), so
    // generation is already 1. After our refresh() it becomes 2.
    const session2 = sessionStore.findByRefreshToken(result.refreshToken)
    expect(session2?.generation).toBe(2)
    // Old access token is no longer in tokenIndex so findByToken returns undefined
    expect(sessionStore.findByToken(accessToken)).toBeUndefined()
  })

  it('should handle concurrent refresh requests safely', async () => {
    const { refreshToken } = await loginUser()
    const [first, second] = await Promise.allSettled([
      refresh(refreshToken, sessionStore, jwtService),
      refresh(refreshToken, sessionStore, jwtService),
    ])
    // At least one must succeed; both should not throw unexpected errors
    const successes = [first, second].filter(r => r.status === 'fulfilled')
    expect(successes.length).toBeGreaterThanOrEqual(1)
  })
})
