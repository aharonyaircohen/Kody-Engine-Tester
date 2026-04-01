import { describe, it, expect, beforeEach } from 'vitest'
import { logout } from './logout'
import { UserStore } from '../../auth/user-store'
import { SessionStore } from '../../auth/session-store'
import { JwtService } from '../../auth/jwt-service'
import { login } from './login'

describe('logout', () => {
  let userStore: UserStore
  let sessionStore: SessionStore
  let jwtService: JwtService

  beforeEach(async () => {
    userStore = new UserStore()
    await userStore.ready
    sessionStore = new SessionStore()
    jwtService = new JwtService('test-secret')
  })

  async function loginUser(email = 'viewer@example.com', pass = 'ViewerPass1!') {
    return login(email, pass, '127.0.0.1', 'UA', userStore, sessionStore, jwtService)
  }

  it('should revoke current session', async () => {
    const { accessToken } = await loginUser()
    const payload = await jwtService.verify(accessToken)
    logout(payload.userId, payload.sessionId, accessToken, false, sessionStore, jwtService)
    // Session should be gone
    expect(sessionStore.findByToken(accessToken)).toBeUndefined()
  })

  it('should blacklist access token', async () => {
    const { accessToken } = await loginUser()
    const payload = await jwtService.verify(accessToken)
    logout(payload.userId, payload.sessionId, accessToken, false, sessionStore, jwtService)
    await expect(jwtService.verify(accessToken)).rejects.toThrow('Token revoked')
  })

  it('should revoke all sessions when allDevices is true', async () => {
    const { accessToken: t1 } = await loginUser()
    const { accessToken: t2 } = await loginUser()
    const payload = await jwtService.verify(t1)
    logout(payload.userId, payload.sessionId, t1, true, sessionStore, jwtService)
    // t2's session should also be revoked
    const payload2 = await jwtService.verify(t2).catch(() => null)
    // t2 wasn't blacklisted but session was revoked
    if (payload2) {
      expect(sessionStore.findByToken(t2)).toBeUndefined()
    }
  })
})
