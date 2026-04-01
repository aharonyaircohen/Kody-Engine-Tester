import { describe, it, expect, beforeEach } from 'vitest'
import { UserStore } from './user-store'
import type { OAuth2Provider } from './oauth2'

describe('UserStore OAuth Linking', () => {
  let store: UserStore

  beforeEach(async () => {
    store = new UserStore()
    await store.ready
  })

  describe('seed users with new roles', () => {
    it('should have admin user seeded with admin role', async () => {
      const admin = await store.findByEmail('admin@example.com')
      expect(admin).toBeDefined()
      expect(admin?.role).toBe('admin')
    })

    it('should have editor user seeded with editor role', async () => {
      const editor = await store.findByEmail('editor@example.com')
      expect(editor).toBeDefined()
      expect(editor?.role).toBe('editor')
    })

    it('should have viewer user seeded with viewer role', async () => {
      const viewer = await store.findByEmail('viewer@example.com')
      expect(viewer).toBeDefined()
      expect(viewer?.role).toBe('viewer')
    })

    it('should have inactive user seeded', async () => {
      const inactive = await store.findByEmail('inactive@example.com')
      expect(inactive).toBeDefined()
      expect(inactive?.isActive).toBe(false)
    })
  })

  describe('createOAuth', () => {
    it('should create OAuth user with google provider', async () => {
      const user = await store.createOAuth({
        email: 'google-user@example.com',
        provider: 'google',
        providerId: 'google-123',
        role: 'viewer',
      })

      expect(user.id).toBeDefined()
      expect(user.email).toBe('google-user@example.com')
      expect(user.provider).toBe('google')
      expect(user.providerId).toBe('google-123')
      expect(user.role).toBe('viewer')
      expect(user.passwordHash).toBe('')
      expect(user.salt).toBe('')
      expect(user.linkedAccounts).toEqual([])
    })

    it('should create OAuth user with github provider', async () => {
      const user = await store.createOAuth({
        email: 'github-user@example.com',
        provider: 'github',
        providerId: 'github-456',
      })

      expect(user.provider).toBe('github')
      expect(user.providerId).toBe('github-456')
      expect(user.role).toBe('viewer') // default role
    })

    it('should throw on duplicate email', async () => {
      await store.createOAuth({
        email: 'oauth-dup@example.com',
        provider: 'google',
        providerId: 'google-dup-1',
      })

      await expect(
        store.createOAuth({
          email: 'oauth-dup@example.com',
          provider: 'github',
          providerId: 'github-dup-1',
        })
      ).rejects.toThrow('Email already exists')
    })
  })

  describe('findByProvider', () => {
    it('should find user by Google provider', async () => {
      await store.createOAuth({
        email: 'find-by-provider@example.com',
        provider: 'google',
        providerId: 'google-find-123',
      })

      const user = await store.findByProvider('google', 'google-find-123')
      expect(user).toBeDefined()
      expect(user?.email).toBe('find-by-provider@example.com')
    })

    it('should return undefined for unknown provider', async () => {
      const user = await store.findByProvider('google', 'nonexistent')
      expect(user).toBeUndefined()
    })
  })

  describe('linkAccount', () => {
    it('should link additional provider to existing user', async () => {
      const viewer = await store.findByEmail('viewer@example.com')!
      expect(viewer.linkedAccounts).toBeUndefined()

      await store.linkAccount(viewer.id, 'github', 'github-link-123')

      const updated = await store.findById(viewer.id)
      expect(updated?.linkedAccounts).toHaveLength(1)
      expect(updated?.linkedAccounts?.[0].provider).toBe('github')
      expect(updated?.linkedAccounts?.[0].providerId).toBe('github-link-123')
    })

    it('should link multiple providers to same user', async () => {
      const viewer = await store.findByEmail('viewer@example.com')!

      await store.linkAccount(viewer.id, 'google', 'google-multi-1')
      await store.linkAccount(viewer.id, 'github', 'github-multi-1')

      const updated = await store.findById(viewer.id)
      expect(updated?.linkedAccounts).toHaveLength(2)
    })

    it('should throw when linking provider to another user', async () => {
      const viewer = await store.findByEmail('viewer@example.com')!
      const editor = await store.findByEmail('editor@example.com')!

      await store.linkAccount(editor.id, 'google', 'google-other-user')

      await expect(store.linkAccount(viewer.id, 'google', 'google-other-user')).rejects.toThrow(
        'Provider account already linked to another user'
      )
    })

    it('should throw when provider already linked', async () => {
      const viewer = await store.findByEmail('viewer@example.com')!

      await store.linkAccount(viewer.id, 'github', 'github-dup-link')

      await expect(store.linkAccount(viewer.id, 'github', 'github-dup-link')).rejects.toThrow(
        'Provider already linked'
      )
    })
  })

  describe('unlinkAccount', () => {
    it('should unlink provider from user', async () => {
      const viewer = await store.findByEmail('viewer@example.com')!

      await store.linkAccount(viewer.id, 'google', 'google-unlink-123')
      await store.unlinkAccount(viewer.id, 'google')

      const updated = await store.findById(viewer.id)
      expect(updated?.linkedAccounts).toHaveLength(0)
    })

    it('should return silently when user has no linked accounts', async () => {
      const viewer = await store.findByEmail('viewer@example.com')!

      // Should not throw - idempotent operation when there are no linked accounts
      await expect(store.unlinkAccount(viewer.id, 'google')).resolves.toBeUndefined()
    })

    it('should throw when provider not linked but user has other linked accounts', async () => {
      const viewer = await store.findByEmail('viewer@example.com')!

      // Link GitHub first
      await store.linkAccount(viewer.id, 'github', 'github-other')

      // Now try to unlink Google (which wasn't linked)
      await expect(store.unlinkAccount(viewer.id, 'google')).rejects.toThrow('Provider not linked')
    })
  })

  describe('getLinkedAccounts', () => {
    it('should return empty array for user with no linked accounts', async () => {
      const viewer = await store.findByEmail('viewer@example.com')!
      const accounts = await store.getLinkedAccounts(viewer.id)
      expect(accounts).toEqual([])
    })

    it('should return linked accounts for user', async () => {
      const viewer = await store.findByEmail('viewer@example.com')!

      await store.linkAccount(viewer.id, 'google', 'google-get-123')
      await store.linkAccount(viewer.id, 'github', 'github-get-456')

      const accounts = await store.getLinkedAccounts(viewer.id)
      expect(accounts).toHaveLength(2)
    })
  })

  describe('deleteProviderIndex', () => {
    it('should clean up provider index on delete', async () => {
      const user = await store.createOAuth({
        email: 'delete-provider@example.com',
        provider: 'google',
        providerId: 'google-delete-123',
      })

      await store.linkAccount(user.id, 'github', 'github-delete-456')

      // Verify user exists and can be found by provider
      expect(await store.findByProvider('google', 'google-delete-123')).toBeDefined()

      await store.delete(user.id)

      // Provider lookups should fail
      expect(await store.findByProvider('google', 'google-delete-123')).toBeUndefined()
      expect(await store.findByProvider('github', 'github-delete-456')).toBeUndefined()
    })
  })

  describe('role hierarchy', () => {
    it('should support admin role', async () => {
      const admin = await store.findByEmail('admin@example.com')
      expect(admin?.role).toBe('admin')
    })

    it('should support editor role', async () => {
      const editor = await store.findByEmail('editor@example.com')
      expect(editor?.role).toBe('editor')
    })

    it('should support viewer role', async () => {
      const viewer = await store.findByEmail('viewer@example.com')
      expect(viewer?.role).toBe('viewer')
    })
  })
})

describe('OAuth Linking Flow', () => {
  let store: UserStore

  beforeEach(async () => {
    store = new UserStore()
    await store.ready
  })

  it('should support full OAuth register → link → unlink flow', async () => {
    // 1. Register new user via Google OAuth
    const newUser = await store.createOAuth({
      email: 'oauth-flow@example.com',
      provider: 'google',
      providerId: 'google-flow-123',
      role: 'viewer',
    })
    expect(newUser.provider).toBe('google')
    expect(newUser.providerId).toBe('google-flow-123')

    // 4. User can find themselves by Google provider
    const byGoogle = await store.findByProvider('google', 'google-flow-123')
    expect(byGoogle?.id).toBe(newUser.id)

    // 2. User wants to link GitHub account
    await store.linkAccount(newUser.id, 'github', 'github-flow-456')

    // 3. Verify GitHub account is linked
    const accounts = await store.getLinkedAccounts(newUser.id)
    expect(accounts).toHaveLength(1)
    expect(accounts[0].provider).toBe('github')

    // 4b. User can still find themselves by Google provider
    const byGoogle2 = await store.findByProvider('google', 'google-flow-123')
    expect(byGoogle2?.id).toBe(newUser.id)

    // 4c. User can also find themselves by GitHub provider
    const byGithub = await store.findByProvider('github', 'github-flow-456')
    expect(byGithub?.id).toBe(newUser.id)

    // 5. User decides to unlink GitHub
    await store.unlinkAccount(newUser.id, 'github')

    // 6. GitHub lookup should fail
    const githubAfterUnlink = await store.findByProvider('github', 'github-flow-456')
    expect(githubAfterUnlink).toBeUndefined()
  })

  it('should find primary provider after unlinking secondary provider', async () => {
    // Create user with Google, link GitHub, then unlink GitHub
    const user = await store.createOAuth({
      email: 'primary-provider-test@example.com',
      provider: 'google',
      providerId: 'google-primary-test',
    })

    await store.linkAccount(user.id, 'github', 'github-secondary-test')
    await store.unlinkAccount(user.id, 'github')

    // Primary Google provider should still be findable
    const found = await store.findByProvider('google', 'google-primary-test')
    expect(found?.id).toBe(user.id)
  })

  it('should handle user registering with Google then linking GitHub', async () => {
    // Create user with Google
    const user = await store.createOAuth({
      email: 'multi-provider@example.com',
      provider: 'google',
      providerId: 'google-multi-flow',
    })

    // Link GitHub
    await store.linkAccount(user.id, 'github', 'github-multi-flow')

    // Verify both work
    const byGoogle = await store.findByProvider('google', 'google-multi-flow')
    const byGithub = await store.findByProvider('github', 'github-multi-flow')

    expect(byGoogle?.id).toBe(byGithub?.id)
    expect(byGoogle?.id).toBe(user.id)
  })
})