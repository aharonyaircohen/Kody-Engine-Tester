/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest'
import { AuthController } from './authController'
import { UserStore } from './user-store'
import { SessionStore, Session } from './session-store'
import { JwtService } from './jwt-service'

describe('AuthController', () => {
  let userStore: UserStore
  let sessionStore: SessionStore
  let jwtService: JwtService
  let controller: AuthController

  beforeEach(async () => {
    userStore = new UserStore()
    await userStore.ready
    sessionStore = new SessionStore()
    jwtService = new JwtService('test-secret')
    controller = new AuthController(userStore, sessionStore, jwtService)
  })

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const result = await controller.login(
        { email: 'admin@example.com', password: 'AdminPass1!' },
        '127.0.0.1',
        'TestAgent'
      )

      expect(result.accessToken).toBeDefined()
      expect(result.refreshToken).toBeDefined()
      expect(result.user.id).toBeDefined()
      expect(result.user.email).toBe('admin@example.com')
      expect(result.user.role).toBe('admin')
    })

    it('should throw error for missing email', async () => {
      await expect(
        controller.login({ email: '', password: 'password' }, '127.0.0.1', 'TestAgent')
      ).rejects.toMatchObject({ message: 'Email and password are required', status: 400 })
    })

    it('should throw error for missing password', async () => {
      await expect(
        controller.login({ email: 'test@example.com', password: '' }, '127.0.0.1', 'TestAgent')
      ).rejects.toMatchObject({ message: 'Email and password are required', status: 400 })
    })

    it('should throw error for invalid email', async () => {
      await expect(
        controller.login({ email: 'nonexistent@example.com', password: 'password' }, '127.0.0.1', 'TestAgent')
      ).rejects.toMatchObject({ message: 'Invalid credentials', status: 401 })
    })

    it('should throw error for wrong password', async () => {
      await expect(
        controller.login({ email: 'admin@example.com', password: 'wrongpassword' }, '127.0.0.1', 'TestAgent')
      ).rejects.toMatchObject({ message: 'Invalid credentials', status: 401 })
    })

    it('should throw error for inactive user', async () => {
      await expect(
        controller.login({ email: 'inactive@example.com', password: 'InactivePass1!' }, '127.0.0.1', 'TestAgent')
      ).rejects.toMatchObject({ message: 'Account is inactive', status: 403 })
    })

    it('should lock account after 5 failed attempts', async () => {
      for (let i = 0; i < 5; i++) {
        try {
          await controller.login({ email: 'viewer@example.com', password: 'wrong' }, '127.0.0.1', 'TestAgent')
        } catch {
          // Expected
        }
      }

      await expect(
        controller.login({ email: 'viewer@example.com', password: 'ViewerPass1!' }, '127.0.0.1', 'TestAgent')
      ).rejects.toMatchObject({ message: 'Account is locked. Please try again later.', status: 423 })
    })

    it('should create session on successful login', async () => {
      await controller.login(
        { email: 'admin@example.com', password: 'AdminPass1!' },
        '127.0.0.1',
        'TestAgent'
      )

      const sessions = Array.from((sessionStore as any).sessions.values() as Session[])
      expect(sessions.length).toBe(1)
      expect(sessions[0].userId).toBe((await userStore.findByEmail('admin@example.com'))?.id)
      expect(sessions[0].ipAddress).toBe('127.0.0.1')
      expect(sessions[0].userAgent).toBe('TestAgent')
    })

    it('should reset failed login attempts on success', async () => {
      const user = await userStore.findByEmail('viewer@example.com')
      for (let i = 0; i < 3; i++) {
        try {
          await controller.login({ email: 'viewer@example.com', password: 'wrong' }, '127.0.0.1', 'TestAgent')
        } catch {
          // Expected
        }
      }

      await controller.login({ email: 'viewer@example.com', password: 'ViewerPass1!' }, '127.0.0.1', 'TestAgent')

      const updated = await userStore.findById(user!.id)
      expect(updated?.failedLoginAttempts).toBe(0)
    })

    it('should update lastLoginAt on success', async () => {
      const before = new Date()
      await controller.login({ email: 'admin@example.com', password: 'AdminPass1!' }, '127.0.0.1', 'TestAgent')

      const user = await userStore.findByEmail('admin@example.com')
      expect(user?.lastLoginAt).toBeDefined()
      expect(user!.lastLoginAt!.getTime()).toBeGreaterThanOrEqual(before.getTime())
    })

    it('should enforce max sessions per user', async () => {
      for (let i = 0; i < 6; i++) {
        await controller.login(
          { email: 'viewer@example.com', password: 'ViewerPass1!' },
          '127.0.0.1',
          'TestAgent'
        )
      }

      const user = await userStore.findByEmail('viewer@example.com')
      const userSessions = Array.from((sessionStore as any).sessions.values()).filter(
        (s: any) => s.userId === user!.id
      )
      expect(userSessions.length).toBe(5) // MAX_SESSIONS_PER_USER
    })
  })

  describe('logout', () => {
    it('should revoke session on logout', async () => {
      const loginResult = await controller.login(
        { email: 'admin@example.com', password: 'AdminPass1!' },
        '127.0.0.1',
        'TestAgent'
      )

      controller.logout(
        loginResult.user.id,
        (sessionStore.findByToken(loginResult.accessToken) as any)?.id || '',
        loginResult.accessToken
      )

      const session = sessionStore.findByToken(loginResult.accessToken)
      expect(session).toBeUndefined()
    })

    it('should blacklist token on logout', async () => {
      const loginResult = await controller.login(
        { email: 'admin@example.com', password: 'AdminPass1!' },
        '127.0.0.1',
        'TestAgent'
      )

      controller.logout(
        loginResult.user.id,
        (sessionStore.findByToken(loginResult.accessToken) as any)?.id || '',
        loginResult.accessToken
      )

      await expect(jwtService.verify(loginResult.accessToken)).rejects.toThrow('Token revoked')
    })

    it('should revoke all sessions when allDevices is true', async () => {
      await controller.login({ email: 'viewer@example.com', password: 'ViewerPass1!' }, '127.0.0.1', 'TestAgent')
      await controller.login({ email: 'viewer@example.com', password: 'ViewerPass1!' }, '127.0.0.1', 'TestAgent')

      const user = await userStore.findByEmail('viewer@example.com')

      controller.logout(user!.id, 'any-session-id', 'any-token', { allDevices: true })

      const userSessions = Array.from((sessionStore as any).sessions.values()).filter(
        (s: any) => s.userId === user!.id
      )
      expect(userSessions.length).toBe(0)
    })
  })

  describe('me', () => {
    it('should return user profile', async () => {
      const loginResult = await controller.login(
        { email: 'admin@example.com', password: 'AdminPass1!' },
        '127.0.0.1',
        'TestAgent'
      )

      const profile = await controller.me(loginResult.user.id)

      expect(profile.id).toBe(loginResult.user.id)
      expect(profile.email).toBe('admin@example.com')
      expect(profile.role).toBe('admin')
      expect(profile.isActive).toBe(true)
      expect(profile.createdAt).toBeInstanceOf(Date)
    })

    it('should exclude sensitive fields', async () => {
      const loginResult = await controller.login(
        { email: 'admin@example.com', password: 'AdminPass1!' },
        '127.0.0.1',
        'TestAgent'
      )

      const profile = await controller.me(loginResult.user.id)

      expect((profile as any).passwordHash).toBeUndefined()
      expect((profile as any).salt).toBeUndefined()
    })

    it('should throw error for unknown user', async () => {
      await expect(controller.me('unknown-user-id')).rejects.toMatchObject({
        message: 'User not found',
        status: 404,
      })
    })
  })

  describe('refresh', () => {
    it('should refresh tokens and increment generation', async () => {
      const loginResult = await controller.login(
        { email: 'admin@example.com', password: 'AdminPass1!' },
        '127.0.0.1',
        'TestAgent'
      )

      const session = sessionStore.findByRefreshToken(loginResult.refreshToken)
      const originalGeneration = session?.generation || 0

      const refreshResult = await controller.refresh(loginResult.refreshToken)

      expect(refreshResult.accessToken).toBeDefined()
      expect(refreshResult.refreshToken).toBeDefined()
      expect(refreshResult.accessToken).not.toBe(loginResult.accessToken)
      expect(refreshResult.refreshToken).not.toBe(loginResult.refreshToken)

      const newSession = sessionStore.findByRefreshToken(refreshResult.refreshToken)
      expect(newSession?.generation).toBe(originalGeneration + 1)
    })

    it('should throw error for invalid refresh token', async () => {
      await expect(controller.refresh('invalid-token')).rejects.toMatchObject({
        message: 'Invalid or expired refresh token',
        status: 401,
      })
    })

    it('should throw error for missing refresh token', async () => {
      await expect(controller.refresh('')).rejects.toMatchObject({
        message: 'Refresh token is required',
        status: 400,
      })
    })

    it('should blacklist old refresh token after refresh', async () => {
      const loginResult = await controller.login(
        { email: 'admin@example.com', password: 'AdminPass1!' },
        '127.0.0.1',
        'TestAgent'
      )

      await controller.refresh(loginResult.refreshToken)

      await expect(jwtService.verify(loginResult.refreshToken)).rejects.toThrow('Token revoked')
    })
  })
})
