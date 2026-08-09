import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Payload } from 'payload'

import { ListVisibleUsersService } from './list-visible-users'
import type { AuthenticatedUser } from './auth-service'

function createMockPayload(findResult: unknown = { docs: [], totalDocs: 0, totalPages: 0, page: 1 }) {
  return {
    find: vi.fn().mockResolvedValue(findResult),
  } as unknown as Payload
}

const sampleUser: AuthenticatedUser = {
  id: 2,
  firstName: 'Editor',
  lastName: 'User',
  email: 'editor@example.com',
  role: 'editor',
  isActive: true,
}

describe('ListVisibleUsersService', () => {
  let service: ListVisibleUsersService
  let mockPayload: ReturnType<typeof createMockPayload>

  beforeEach(() => {
    mockPayload = createMockPayload()
    service = new ListVisibleUsersService(mockPayload)
  })

  describe('listVisibleUsers — find call', () => {
    it('targets the users collection, excludes admins, and forwards the caller as the access-control subject', async () => {
      await service.listVisibleUsers(sampleUser, { page: 1, limit: 20 })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.collection).toBe('users')
      expect(JSON.stringify(call.where)).toContain('not_in')
      expect(JSON.stringify(call.where)).toContain('admin')
      expect(call.user).toBe(sampleUser)
    })
  })

  describe('listVisibleUsers — pagination pass-through', () => {
    it('forwards the supplied page and limit to payload.find', async () => {
      await service.listVisibleUsers(sampleUser, { page: 3, limit: 7 })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.page).toBe(3)
      expect(call.limit).toBe(7)
    })
  })

  describe('listVisibleUsers — result shape', () => {
    it('returns a typed ListVisibleUsersResult with empty data and zero meta', async () => {
      const result = await service.listVisibleUsers(sampleUser, { page: 1, limit: 20 })
      expect(result.data).toEqual([])
      expect(result.meta).toEqual({ total: 0, page: 1, limit: 20, totalPages: 0 })
    })

    it('propagates payload result docs and totals', async () => {
      mockPayload = createMockPayload({
        docs: [sampleUser],
        totalDocs: 25,
        totalPages: 3,
        page: 2,
      })
      service = new ListVisibleUsersService(mockPayload)

      const result = await service.listVisibleUsers(sampleUser, { page: 2, limit: 10 })
      expect(result.data).toHaveLength(1)
      expect(result.meta.total).toBe(25)
      expect(result.meta.totalPages).toBe(3)
      expect(result.meta.page).toBe(2)
      expect(result.meta.limit).toBe(10)
    })

    it('falls back to requested page when payload response has no page', async () => {
      mockPayload = createMockPayload({ docs: [], totalDocs: 0, totalPages: 0 })
      service = new ListVisibleUsersService(mockPayload)

      const result = await service.listVisibleUsers(sampleUser, { page: 4, limit: 10 })
      expect(result.meta.page).toBe(4)
    })
  })
})
