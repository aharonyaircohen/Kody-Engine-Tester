import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

// Integration tests require a live database — skip when no connection string is set.
const dbUrl = process.env.DATABASE_URI ?? process.env.POSTGRES_URL
const describeIfDb = dbUrl ? describe : describe.skip

let payload: Payload

describeIfDb('Course Search API — /api/courses/search', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  describe('GET /api/courses/search — happy path', () => {
    it('returns 200 with SearchResult shape for a basic query', async () => {
      // Make an HTTP request to the Next.js dev server.
      // During CI / test runs this uses the test host.
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
      const res = await fetch(`${baseUrl}/api/courses/search?q=typescript`)

      expect(res.status).toBe(200)

      const body = await res.json() as Record<string, unknown>

      // Verify expected shape
      expect(body).toHaveProperty('items')
      expect(Array.isArray(body.items)).toBe(true)
      expect(body).toHaveProperty('total')
      expect(typeof body.total).toBe('number')
      expect(body).toHaveProperty('page')
      expect(typeof body.page).toBe('number')
      expect(body).toHaveProperty('pageSize')
      expect(typeof body.pageSize).toBe('number')
      expect(body).toHaveProperty('totalPages')
      expect(typeof body.totalPages).toBe('number')
    })

    it('returns 200 with empty items when no courses match', async () => {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
      const res = await fetch(`${baseUrl}/api/courses/search?q=xyznotexistcourse`)

      expect(res.status).toBe(200)
      const body = await res.json() as { items: unknown[]; total: number }
      expect(Array.isArray(body.items)).toBe(true)
      expect(body.total).toBe(0)
    })
  })

  describe('GET /api/courses/search — validation', () => {
    it('returns 400 with { error } when difficulty is invalid', async () => {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
      const res = await fetch(`${baseUrl}/api/courses/search?difficulty=expert`)

      expect(res.status).toBe(400)

      const body = await res.json() as { error?: string }
      expect(body).toHaveProperty('error')
      expect(typeof body.error).toBe('string')
      expect(body.error).toContain('Invalid difficulty')
    })

    it('returns 400 for partially invalid difficulty value', async () => {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
      const res = await fetch(`${baseUrl}/api/courses/search?difficulty=intermedia`)

      expect(res.status).toBe(400)
      const body = await res.json() as { error?: string }
      expect(body.error).toBeDefined()
    })
  })

  describe('GET /api/courses/search — pagination', () => {
    it('returns 200 and respects pageSize parameter', async () => {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
      const res = await fetch(`${baseUrl}/api/courses/search?pageSize=5`)

      expect(res.status).toBe(200)
      const body = await res.json() as { pageSize: number; items: unknown[] }
      expect(body.pageSize).toBe(5)
    })

    it('returns 200 and respects page parameter', async () => {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
      const res = await fetch(`${baseUrl}/api/courses/search?page=2`)

      expect(res.status).toBe(200)
      const body = await res.json() as { page: number }
      expect(body.page).toBe(2)
    })
  })

  describe('GET /api/courses/search — filters', () => {
    it('returns 200 with valid difficulty filter', async () => {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
      const res = await fetch(`${baseUrl}/api/courses/search?difficulty=beginner`)

      expect(res.status).toBe(200)
    })

    it('returns 200 with instructor filter', async () => {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
      const res = await fetch(`${baseUrl}/api/courses/search?instructor=alice`)

      expect(res.status).toBe(200)
    })
  })

  describe('GET /api/courses/search — published-only', () => {
    it('does not return unpublished courses in the items array', async () => {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
      const res = await fetch(`${baseUrl}/api/courses/search`)

      expect(res.status).toBe(200)
      const body = await res.json() as { items: Array<{ status?: string }> }
      for (const course of body.items) {
        expect(course.status ?? 'published').toBe('published')
      }
    })
  })
})
