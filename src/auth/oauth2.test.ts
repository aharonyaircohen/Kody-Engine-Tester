import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  GoogleOAuth2Provider,
  GitHubOAuth2Provider,
  createOAuth2Providers,
  createAuthorizationUrl,
  handleOAuth2Callback,
  generateCodeVerifier,
  generateCodeChallenge,
  createState,
  validateState,
} from './oauth2'

describe('OAuth2', () => {
  const googleConfig = {
    clientId: 'google-client-id',
    clientSecret: 'google-client-secret',
    callbackUrl: 'http://localhost:3000/auth/callback/google',
    scopes: ['openid', 'email', 'profile'],
  }

  const githubConfig = {
    clientId: 'github-client-id',
    clientSecret: 'github-client-secret',
    callbackUrl: 'http://localhost:3000/auth/callback/github',
    scopes: ['read:user', 'user:email'],
  }

  describe('generateCodeVerifier', () => {
    it('should generate a random string of appropriate length', () => {
      const verifier = generateCodeVerifier()
      expect(verifier).toBeDefined()
      expect(typeof verifier).toBe('string')
      expect(verifier.length).toBeGreaterThan(0)
      expect(verifier.length).toBeLessThanOrEqual(64)
    })

    it('should generate unique verifiers', () => {
      const verifiers = new Set<string>()
      for (let i = 0; i < 100; i++) {
        verifiers.add(generateCodeVerifier())
      }
      expect(verifiers.size).toBe(100)
    })
  })

  describe('generateCodeChallenge', () => {
    it('should generate a base64url encoded challenge from verifier', async () => {
      const verifier = 'test-verifier-string'
      const challenge = await generateCodeChallenge(verifier)
      expect(challenge).toBeDefined()
      expect(typeof challenge).toBe('string')
      // Should be base64url encoded (no + or /)
      expect(challenge).not.toMatch(/[+/]/)
    })

    it('should generate consistent challenges for same input', async () => {
      const verifier = 'consistent-verifier'
      const challenge1 = await generateCodeChallenge(verifier)
      const challenge2 = await generateCodeChallenge(verifier)
      expect(challenge1).toBe(challenge2)
    })
  })

  describe('GoogleOAuth2Provider', () => {
    let provider: GoogleOAuth2Provider

    beforeEach(() => {
      provider = new GoogleOAuth2Provider(googleConfig)
    })

    describe('createState', () => {
      it('should create a valid state object', () => {
        const { state, codeVerifier } = createState('google', 'http://localhost:3000/dashboard')
        expect(state).toBeDefined()
        expect(codeVerifier).toBeDefined()
        expect(codeVerifier.length).toBe(64)
      })

      it('should store state for later validation', () => {
        const { state } = createState('google', 'http://localhost:3000/dashboard')
        const decoded = JSON.parse(Buffer.from(state, 'base64url').toString())
        expect(decoded.provider).toBe('google')
        expect(decoded.redirectUrl).toBe('http://localhost:3000/dashboard')
        expect(decoded.codeVerifier).toBeDefined()
      })
    })

    describe('getAuthorizationUrl', () => {
      it('should return a valid Google authorization URL', async () => {
        const { state, codeVerifier } = createState('google')
        const codeChallenge = await generateCodeChallenge(codeVerifier)
        const url = await provider.getAuthorizationUrl(state, codeChallenge)

        expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth')
        expect(url).toContain(`client_id=${googleConfig.clientId}`)
        expect(url).toContain(`redirect_uri=${encodeURIComponent(googleConfig.callbackUrl)}`)
        expect(url).toContain('code_challenge=')
        expect(url).toContain('code_challenge_method=S256')
        expect(url).toContain('access_type=offline')
        expect(url).toContain('prompt=consent')
      })
    })

    describe('validateState', () => {
      it('should return state object for valid state', () => {
        const { state } = createState('google', 'http://localhost:3000/dashboard')
        const validated = validateState(state)

        expect(validated).not.toBeNull()
        expect(validated?.provider).toBe('google')
        expect(validated?.redirectUrl).toBe('http://localhost:3000/dashboard')
      })

      it('should return null for invalid state', () => {
        const validated = validateState('invalid-state')
        expect(validated).toBeNull()
      })

      it('should only allow state to be used once', () => {
        const { state } = createState('google')
        const first = validateState(state)
        const second = validateState(state)
        expect(first).not.toBeNull()
        expect(second).toBeNull()
      })
    })

    describe('exchangeCode', () => {
      it('should throw error when token exchange fails', async () => {
        global.fetch = vi.fn().mockResolvedValue({
          ok: false,
          status: 400,
        })

        await expect(provider.exchangeCode('invalid-code', 'verifier')).rejects.toThrow('Google token exchange failed')
      })
    })

    describe('getUserInfo', () => {
      it('should throw error when user info fetch fails', async () => {
        global.fetch = vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
        })

        await expect(provider.getUserInfo('invalid-token')).rejects.toThrow('Google user info fetch failed')
      })

      it('should return user info on success', async () => {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({
            sub: 'google-123',
            email: 'user@gmail.com',
            name: 'Test User',
            picture: 'https://example.com/photo.jpg',
          }),
        })

        const userInfo = await provider.getUserInfo('valid-token')
        expect(userInfo.provider).toBe('google')
        expect(userInfo.providerId).toBe('google-123')
        expect(userInfo.email).toBe('user@gmail.com')
        expect(userInfo.name).toBe('Test User')
        expect(userInfo.picture).toBe('https://example.com/photo.jpg')
      })
    })
  })

  describe('GitHubOAuth2Provider', () => {
    let provider: GitHubOAuth2Provider

    beforeEach(() => {
      provider = new GitHubOAuth2Provider(githubConfig)
    })

    describe('createState', () => {
      it('should create a valid state object', () => {
        const { state, codeVerifier } = createState('github', 'http://localhost:3000/dashboard')
        expect(state).toBeDefined()
        expect(codeVerifier).toBeDefined()
      })
    })

    describe('getAuthorizationUrl', () => {
      it('should return a valid GitHub authorization URL', async () => {
        const { state, codeVerifier } = createState('github')
        const url = await provider.getAuthorizationUrl(state, codeVerifier)

        expect(url).toContain('https://github.com/login/oauth/authorize')
        expect(url).toContain(`client_id=${githubConfig.clientId}`)
        expect(url).toContain(`redirect_uri=${encodeURIComponent(githubConfig.callbackUrl)}`)
        expect(url).toContain('scope=')
      })
    })

    describe('exchangeCode', () => {
      it('should throw error when token exchange fails', async () => {
        global.fetch = vi.fn().mockResolvedValue({
          ok: false,
          status: 400,
        })

        await expect(provider.exchangeCode('invalid-code', 'verifier')).rejects.toThrow('GitHub token exchange failed')
      })

      it('should handle GitHub OAuth error response', async () => {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({
            error: 'incorrect_client_credentials',
            error_description: 'The client credentials are incorrect',
          }),
        })

        await expect(provider.exchangeCode('invalid-code', 'verifier')).rejects.toThrow('GitHub OAuth error')
      })

      it('should return token response on success', async () => {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({
            access_token: 'ghp_testtoken',
            token_type: 'bearer',
          }),
        })

        const result = await provider.exchangeCode('valid-code', 'verifier')
        expect(result.accessToken).toBe('ghp_testtoken')
        expect(result.tokenType).toBe('bearer')
        expect(result.refreshToken).toBeUndefined()
      })
    })

    describe('getUserInfo', () => {
      it('should return user info with email', async () => {
        global.fetch = vi.fn()
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({
              id: 12345,
              login: 'testuser',
              name: 'Test User',
              avatar_url: 'https://example.com/avatar.png',
              email: 'user@example.com',
            }),
          })

        const userInfo = await provider.getUserInfo('valid-token')
        expect(userInfo.provider).toBe('github')
        expect(userInfo.providerId).toBe('12345')
        expect(userInfo.email).toBe('user@example.com')
      })

      it('should fetch email from emails endpoint if not public', async () => {
        global.fetch = vi.fn()
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({
              id: 12345,
              login: 'testuser',
              name: 'Test User',
              avatar_url: 'https://example.com/avatar.png',
              email: null,
            }),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve([
              { email: 'primary@example.com', primary: true, verified: true },
              { email: 'other@example.com', primary: false, verified: true },
            ]),
          })

        const userInfo = await provider.getUserInfo('valid-token')
        expect(userInfo.email).toBe('primary@example.com')
      })

      it('should throw error if no verified email', async () => {
        global.fetch = vi.fn()
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({
              id: 12345,
              login: 'testuser',
              email: null,
            }),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve([
              { email: 'unverified@example.com', primary: true, verified: false },
            ]),
          })

        await expect(provider.getUserInfo('valid-token')).rejects.toThrow('GitHub account has no verified email')
      })
    })
  })

  describe('createOAuth2Providers', () => {
    it('should create providers for both Google and GitHub', () => {
      const providers = createOAuth2Providers({
        google: googleConfig,
        github: githubConfig,
      })

      expect(providers.google).toBeInstanceOf(GoogleOAuth2Provider)
      expect(providers.github).toBeInstanceOf(GitHubOAuth2Provider)
    })
  })

  describe('createAuthorizationUrl', () => {
    it('should create authorization URL for Google', async () => {
      const providers = createOAuth2Providers({
        google: googleConfig,
        github: githubConfig,
      })

      const result = await createAuthorizationUrl('google', providers, 'http://localhost:3000/dashboard')

      expect(result.url).toContain('https://accounts.google.com/o/oauth2/v2/auth')
      expect(result.state).toBeDefined()
      expect(result.codeVerifier).toBeDefined()
    })

    it('should create authorization URL for GitHub', async () => {
      const providers = createOAuth2Providers({
        google: googleConfig,
        github: githubConfig,
      })

      const result = await createAuthorizationUrl('github', providers, 'http://localhost:3000/dashboard')

      expect(result.url).toContain('https://github.com/login/oauth/authorize')
      expect(result.state).toBeDefined()
      expect(result.codeVerifier).toBeDefined()
    })
  })

  describe('handleOAuth2Callback', () => {
    it('should throw error for invalid state', async () => {
      const providers = createOAuth2Providers({
        google: googleConfig,
        github: githubConfig,
      })

      await expect(handleOAuth2Callback('google', providers, 'code', 'invalid-state', 'verifier')).rejects.toThrow('Invalid or expired OAuth2 state')
    })

    it('should throw error for provider mismatch', async () => {
      const providers = createOAuth2Providers({
        google: googleConfig,
        github: githubConfig,
      })

      // Create state for github but try to use it with google
      const { state, codeVerifier } = createState('github')
      await expect(handleOAuth2Callback('google', providers, 'code', state, codeVerifier)).rejects.toThrow('OAuth2 provider mismatch')
    })
  })
})
