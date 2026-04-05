import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getProfile, updateProfile } from './profile'

// Mock Payload
const mockPayload = {
  findByID: vi.fn(),
  find: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
}

vi.mock('@/getPayload', () => ({
  getPayloadInstance: vi.fn(() => mockPayload),
}))

describe('profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        id: 1,
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
      }

      mockPayload.find.mockResolvedValue({ docs: [mockUser] })

      const profile = await getProfile('1', mockPayload as any)
      expect(profile.id).toBe(1)
      expect(profile.email).toBe('admin@example.com')
      expect(profile.role).toBe('admin')
      expect(profile.firstName).toBe('Admin')
    })

    it('should return 404 for unknown user', async () => {
      mockPayload.find.mockResolvedValue({ docs: [] })

      await expect(getProfile('unknown', mockPayload as any)).rejects.toMatchObject({ status: 404 })
    })
  })

  describe('updateProfile', () => {
    it('should update email', async () => {
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'viewer',
        isActive: true,
      }

      mockPayload.find.mockResolvedValue({ docs: [mockUser] })
      mockPayload.update.mockResolvedValue({ ...mockUser, email: 'new@example.com' })

      const updated = await updateProfile('1', { email: 'new@example.com' }, mockPayload as any)
      expect(updated.email).toBe('new@example.com')
    })

    it('should update firstName and lastName', async () => {
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'viewer',
        isActive: true,
      }

      mockPayload.find.mockResolvedValue({ docs: [mockUser] })
      mockPayload.update.mockResolvedValue({ ...mockUser, firstName: 'New', lastName: 'Name' })

      const updated = await updateProfile('1', { firstName: 'New', lastName: 'Name' }, mockPayload as any)
      expect(updated.firstName).toBe('New')
      expect(updated.lastName).toBe('Name')
    })

    it('should return 404 for unknown user', async () => {
      mockPayload.find.mockResolvedValue({ docs: [] })

      await expect(updateProfile('unknown', { email: 'x@x.com' }, mockPayload as any))
        .rejects.toMatchObject({ status: 404 })
    })
  })
})
