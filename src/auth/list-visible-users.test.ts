import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Payload } from 'payload'

import { ListVisibleUsersService } from './list-visible-users'
import type { RbacRole } from './auth-service'

function createMockPayload(findResult: unknown = { docs: [], totalDocs: 0, totalPages: 0, page: 1 }) {
  return {
    find: vi.fn().mockResolvedValue(findResult),
  } as unknown as Payload
}

const sampleUser = {
  id: 2,
  firstName: 'Editor',
  lastName: 'User',
  email: 'editor@example.com',
  role: 'editor' as RbacRole,
  collection: 'users' as const,
  updatedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('ListVisibleUsersService', () => {
  let service: ListVisibleUsersService
  let mockPayload: ReturnType<typeof createMockPayload>

  beforeEach(() => {
    mockPayload = createMockPayload()
    service = new ListVisibleUsersService(mockPayload)
  })

  describe('listVisibleUsers — role filter', () => {
    it('excludes admin users from the result set', async () => {
      await service.listVisibleUsers(sampleUser)
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const whereStr = JSON.stringify(call.where)
      expect(whereStr).toContain('admin')
      expect(whereStr).toContain('not_in')
    })

    it('targets the users collection', async () => {
      await service.listVisibleUsers(sampleUser)
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.collection).toBe('users')
    })

    it('passes the requesting user as the access-control subject', async () => {
      await service.listVisibleUsers(sampleUser)
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.user).toBe(sampleUser)
    })
  })

  describe('listVisibleUsers — pagination defaults', () => {
    it('uses page 1 and limit 20 by default', async () => {
      await service.listVisibleUsers(sampleUser)
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.page).toBe(1)
      expect(call.limit).toBe(20)
    })

    it('accepts custom page and limit', async () => {
      await service.listVisibleUsers(sampleUser, { page: 3, limit: 7 })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.page).toBe(3)
      expect(call.limit).toBe(7)
    })
  })

  describe('listVisibleUsers — bounds hardening', () => {
    it('clamps page=0 to page=1', async () => {
      await service.listVisibleUsers(sampleUser, { page: 0 })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.page).toBe(1)
    })

    it('clamps negative page to page=1', async () => {
      await service.listVisibleUsers(sampleUser, { page: -5 })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.page).toBe(1)
    })

    it('clamps limit=0 to limit=1', async () => {
      await service.listVisibleUsers(sampleUser, { limit: 0 })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.limit).toBe(1)
    })

    it('clamps negative limit to limit=1', async () => {
      await service.listVisibleUsers(sampleUser, { limit: -10 })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.limit).toBe(1)
    })

    it('caps limit at MAX_VISIBLE_USERS (100)', async () => {
      await service.listVisibleUsers(sampleUser, { limit: 9999 })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.limit).toBe(100)
    })

    it('floors fractional page to integer', async () => {
      await service.listVisibleUsers(sampleUser, { page: 2.7 })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.page).toBe(2)
    })

    it('floors fractional limit to integer', async () => {
      await service.listVisibleUsers(sampleUser, { limit: 12.9 })
      const call = (mockPayload.find as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(call.limit).toBe(12)
    })
  })

  describe('listVisibleUsers — result shape', () => {
    it('returns a typed ListVisibleUsersResult with empty data and zero meta', async () => {
      const result = await service.listVisibleUsers(sampleUser)
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
