import { describe, it, expect, beforeEach } from 'vitest'
import { getProfile, updateProfile } from './profile'
import { UserStore } from '../../auth/user-store'

describe('profile', () => {
  let userStore: UserStore

  beforeEach(async () => {
    userStore = new UserStore()
    await userStore.ready
  })

  describe('getProfile', () => {
    it('should return user profile without passwordHash', async () => {
      const user = await userStore.findByEmail('admin@example.com')
      const profile = await getProfile(user!.id, userStore)
      expect(profile.id).toBe(user!.id)
      expect(profile.email).toBe(user!.email)
      expect(profile.role).toBe(user!.role)
      expect((profile as any).passwordHash).toBeUndefined()
      expect((profile as any).salt).toBeUndefined()
    })

    it('should return 404 for unknown user', async () => {
      await expect(getProfile('unknown', userStore)).rejects.toMatchObject({ status: 404 })
    })
  })

  describe('updateProfile', () => {
    it('should update email', async () => {
      const user = await userStore.findByEmail('user@example.com')
      const updated = await updateProfile(user!.id, { email: 'new@example.com' }, userStore)
      expect(updated.email).toBe('new@example.com')
    })

    it('should update password with current password verification', async () => {
      const user = await userStore.findByEmail('user@example.com')
      const updated = await updateProfile(user!.id, { newPassword: 'NewPass2!', currentPassword: 'UserPass1!' }, userStore)
      expect(updated).toBeDefined()
    })

    it('should return 401 for wrong current password', async () => {
      const user = await userStore.findByEmail('user@example.com')
      await expect(updateProfile(user!.id, { newPassword: 'NewPass2!', currentPassword: 'wrongpassword' }, userStore))
        .rejects.toMatchObject({ status: 401 })
    })

    it('should return 400 for weak new password', async () => {
      const user = await userStore.findByEmail('user@example.com')
      await expect(updateProfile(user!.id, { newPassword: 'weak', currentPassword: 'UserPass1!' }, userStore))
        .rejects.toMatchObject({ status: 400 })
    })

    it('should return 404 for unknown user', async () => {
      await expect(updateProfile('unknown', { email: 'x@x.com' }, userStore))
        .rejects.toMatchObject({ status: 404 })
    })
  })
})
