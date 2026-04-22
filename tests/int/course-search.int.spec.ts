import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

// Integration tests require a live database — skip when no connection string is set.
const dbUrl = process.env.DATABASE_URI ?? process.env.POSTGRES_URL
const describeIfDb = dbUrl ? describe : describe.skip

let payload: Payload

// Seeded IDs (Payload uses numeric IDs) — cleaned up after the block.
let seededInstructorId: string | number = ''
let seededCourseId: string | number = ''

describeIfDb('Course Search API — /api/courses/search', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    // Seed an instructor user and a published course so instructor-filter assertions
    // are meaningful (not just a 200 status check).
    const instructor = await payload.create({
      collection: 'users',
      data: {
        email: `test-instructor-${Date.now()}@example.com`,
        firstName: 'Jane',
        lastName: 'Doe',
        displayName: 'Jane Doe',
        password: 'unused-in-test',
        role: 'editor',
      },
    })
    seededInstructorId = instructor.id

    const course = await payload.create({
      collection: 'courses',
      data: {
        title: 'Test Course for Instructor Filter',
        description: {
          root: {
            type: 'root',
            children: [],
            direction: null,
            format: '',
            indent: 0,
            version: 1,
          },
        },
        status: 'published',
        difficulty: 'beginner',
        instructor: seededInstructorId as number,
      },
    })
    seededCourseId = course.id
  })

  afterAll(async () => {
    if (seededCourseId) {
      await payload.delete({ collection: 'courses', id: seededCourseId as string })
    }
    if (seededInstructorId) {
      await payload.delete({ collection: 'users', id: seededInstructorId as string })
    }
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

    it('returns the seeded course when filtering by its instructor name', async () => {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
      const res = await fetch(`${baseUrl}/api/courses/search?instructor=Jane%20Doe`)

      expect(res.status).toBe(200)
      const body = await res.json() as { items: Array<{ id: string }>; total: number }
      expect(body.items.some((c) => c.id === seededCourseId)).toBe(true)
    })

    it('excludes the seeded course when filtering by a non-matching instructor name', async () => {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
      const res = await fetch(`${baseUrl}/api/courses/search?instructor=NoSuchInstructor123`)

      expect(res.status).toBe(200)
      const body = await res.json() as { items: Array<{ id: string }> }
      expect(body.items.some((c) => c.id === seededCourseId)).toBe(false)
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
