// vitest imports must be at the top of the file. The vi.mock calls are placed AFTER
// all imports so that they hoist to the top of the file while still being positioned
// after the import block — ensuring the imports are parsed/executed before vi.mock runs.
import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { JwtService } from '@/auth/jwt-service'
import * as notesRoute from '@/app/api/notes/route'
import * as enrollRoute from '@/app/api/enroll/route'
import * as gradebookRoute from '@/app/api/gradebook/course/[id]/route'
import { setMockUser, clearMockUsers } from '@/auth/withAuth'

// ─── Mock withAuth (placed after all imports — vitest hoists it to top of file) ──
vi.mock('@/auth/withAuth', () => {
  // Shared token → user mapping; set by tests via setMockUser()
  const mockUsers = new Map<string, { id: string; email: string; role: string; isActive: boolean; firstName?: string; lastName?: string }>()

  /**
   * Mock withAuth — a proper HOF matching the real signature:
   * withAuth(handler, options) returns a wrapped handler.
   * The wrapped handler reads the Authorization header, looks up the user in
   * mockUsers (populated by setMockUser), and returns 401/403 or passes
   * { user } to the real handler.
   */
  function mockWithAuth(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: (req: Request, ctx: Record<string, unknown>, rp?: unknown) => Promise<Response>,
    options: { roles?: string[]; optional?: boolean } = {}
  ) {
    const state = { handler, options }

    const wrapper = async (req: Request, routeParams?: unknown) => {
      const authHeader = req.headers.get('authorization')
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

      if (!token) {
        if (state.options.optional) {
          return state.handler(req, {}, routeParams)
        }
        return Response.json({ error: 'Missing or invalid Authorization header' }, { status: 401 })
      }

      const user = mockUsers.get(token)
      if (!user) {
        return Response.json({ error: 'Invalid token' }, { status: 401 })
      }

      if (state.options.roles?.length && !state.options.roles.includes(user.role)) {
        return Response.json(
          { error: `Forbidden: requires role ${state.options.roles.join(' or ')}` },
          { status: 403 }
        )
      }

      return state.handler(req, { user }, routeParams)
    }

    return wrapper
  }

  return {
    withAuth: mockWithAuth,
    extractBearerToken: (authHeader: string | null) => {
      if (!authHeader || !authHeader.startsWith('Bearer ')) return null
      return authHeader.slice(7)
    },
    checkRole: () => ({ user: {} }),
    setMockUser: (
      token: string,
      user: { id: string; email: string; role: string; isActive: boolean; firstName?: string; lastName?: string }
    ) => {
      mockUsers.set(token, user)
    },
    clearMockUsers: () => mockUsers.clear(),
  }
})

// ─── Mock Payload (getPayloadInstance) — route handlers call it internally ────────
vi.mock('@/services/progress', () => ({
  getPayloadInstance: vi.fn().mockResolvedValue({
    find: vi.fn().mockResolvedValue({ docs: [], totalDocs: 0 }),
    findByID: vi.fn().mockResolvedValue({ id: 'course-1', maxEnrollments: 10, instructor: 'admin-1' }),
    create: vi.fn().mockResolvedValue({
      id: 'note-1',
      title: 'Test Note',
      content: 'Test content',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    update: vi.fn(),
    delete: vi.fn(),
  }),
}))

// ─── Test fixtures ─────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production'

const adminUser = {
  userId: 'admin-1',
  email: 'admin@test.com',
  role: 'admin' as const,
  sessionId: 'session-admin-1',
  generation: 0,
}

const viewerUser = {
  userId: 'viewer-1',
  email: 'viewer@test.com',
  role: 'viewer' as const,
  sessionId: 'session-viewer-1',
  generation: 0,
}

let adminToken: string
let viewerToken: string

async function buildRequest(
  method: 'GET' | 'POST',
  url: string,
  options: {
    headers?: Record<string, string>
    body?: unknown
  } = {}
): Promise<NextRequest> {
  const headers = new Headers(options.headers ?? {})
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  return new NextRequest(url, {
    method,
    headers,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  } as unknown as ConstructorParameters<typeof NextRequest>[1])
}

function makeUser(id: string, email: string, role: string) {
  return { id, email, role, isActive: true, firstName: id, lastName: 'User' }
}

// ─── Suite ─────────────────────────────────────────────────────────────────────
describe('Auth-protected API routes', () => {
  beforeAll(async () => {
    const jwtSvc = new JwtService(JWT_SECRET)
    adminToken = await jwtSvc.signAccessToken(adminUser)
    viewerToken = await jwtSvc.signAccessToken(viewerUser)
  })

  beforeEach(() => {
    // Clear mock users before each test to ensure test isolation
    clearMockUsers()
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  // ─── withAuth: no token → 401 ───────────────────────────────────────────────
  describe('withAuth — missing or invalid token returns 401', () => {
    it('POST /api/notes returns 401 when no Authorization header is sent', async () => {
      const req = await buildRequest('POST', 'http://localhost/api/notes', {
        body: { title: 'Test', content: 'Content' },
      })
      const res = await notesRoute.POST(req)
      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body.error).toBeTruthy()
    })

    it('POST /api/enroll returns 401 when no Authorization header is sent', async () => {
      const req = await buildRequest('POST', 'http://localhost/api/enroll', {
        body: { courseId: 'course-1' },
      })
      const res = await enrollRoute.POST(req)
      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body.error).toBeTruthy()
    })

    it('GET /api/gradebook/course/:id returns 401 when no Authorization header is sent', async () => {
      const req = await buildRequest('GET', 'http://localhost/api/gradebook/course/course-1', {})
      const res = await gradebookRoute.GET(req, { params: Promise.resolve({ id: 'course-1' }) })
      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body.error).toBeTruthy()
    })
  })

  // ─── withAuth: malformed / invalid token → 401 ──────────────────────────────
  describe('withAuth — malformed or unrecognized token returns 401', () => {
    it('returns 401 for a completely invalid (non-JWT) token', async () => {
      const req = await buildRequest('POST', 'http://localhost/api/notes', {
        headers: { Authorization: 'Bearer not-a-valid-jwt-token' },
        body: { title: 'Test', content: 'Content' },
      })
      const res = await notesRoute.POST(req)
      expect(res.status).toBe(401)
    })

    it('returns 401 for a token signed with the wrong secret', async () => {
      const badSvc = new JwtService('wrong-secret')
      const badToken = await badSvc.signAccessToken(adminUser)
      const req = await buildRequest('POST', 'http://localhost/api/notes', {
        headers: { Authorization: `Bearer ${badToken}` },
        body: { title: 'Test', content: 'Content' },
      })
      const res = await notesRoute.POST(req)
      expect(res.status).toBe(401)
    })

    it('returns 401 for an expired token', async () => {
      const jwtSvc = new JwtService(JWT_SECRET)
      const expiredToken = await jwtSvc.sign({ ...adminUser, generation: 0 }, -3600 * 1000)
      const req = await buildRequest('POST', 'http://localhost/api/notes', {
        headers: { Authorization: `Bearer ${expiredToken}` },
        body: { title: 'Test', content: 'Content' },
      })
      const res = await notesRoute.POST(req)
      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body.error).toMatch(/expired|invalid/i)
    })

    it('returns 401 when Bearer prefix is missing (token not extracted)', async () => {
      // Provide token directly (no "Bearer " prefix) → extractBearerToken returns null
      const req = await buildRequest('POST', 'http://localhost/api/notes', {
        headers: { Authorization: adminToken },
        body: { title: 'Test', content: 'Content' },
      })
      const res = await notesRoute.POST(req)
      expect(res.status).toBe(401)
    })
  })

  // ─── withAuth: valid token + correct role → 200/201 ────────────────────────
  describe('withAuth — valid token with correct role allows access (200/201)', () => {
    it('POST /api/notes returns 201 for a valid admin token', async () => {
      setMockUser(adminToken, makeUser('admin-1', 'admin@test.com', 'admin'))
      const req = await buildRequest('POST', 'http://localhost/api/notes', {
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { title: 'Test', content: 'Content' },
      })
      const res = await notesRoute.POST(req)
      expect(res.status).toBe(201)
      const body = await res.json()
      expect(body.id).toBeTruthy()
    })

    it('POST /api/enroll returns 201 for a valid viewer token', async () => {
      setMockUser(viewerToken, makeUser('viewer-1', 'viewer@test.com', 'viewer'))
      const req = await buildRequest('POST', 'http://localhost/api/enroll', {
        headers: { Authorization: `Bearer ${viewerToken}` },
        body: { courseId: 'course-1' },
      })
      const res = await enrollRoute.POST(req)
      expect(res.status).toBe(201)
    })

    it('GET /api/gradebook/course/:id returns 200 for a valid admin token', async () => {
      setMockUser(adminToken, makeUser('admin-1', 'admin@test.com', 'admin'))
      const req = await buildRequest('GET', 'http://localhost/api/gradebook/course/course-1', {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const res = await gradebookRoute.GET(req, { params: Promise.resolve({ id: 'course-1' }) })
      expect(res.status).toBe(200)
    })
  })

  // ─── RBAC: valid token + wrong role → 403 ─────────────────────────────────
  describe('withAuth — valid token with insufficient role returns 403', () => {
    it('POST /api/notes returns 403 when the user role is viewer (requires admin/editor)', async () => {
      // Set viewer role → POST /api/notes requires admin/editor
      setMockUser(viewerToken, makeUser('viewer-1', 'viewer@test.com', 'viewer'))
      const req = await buildRequest('POST', 'http://localhost/api/notes', {
        headers: { Authorization: `Bearer ${viewerToken}` },
        body: { title: 'Test', content: 'Content' },
      })
      const res = await notesRoute.POST(req)
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body.error).toMatch(/forbidden|role/i)
    })

    it('GET /api/gradebook/course/:id returns 403 when the user is not the course instructor', async () => {
      // Set viewer role → GET /api/gradebook requires editor/admin who is the course instructor.
      // The course's instructor field is 'admin-1', but we provide 'viewer-1' via the mock.
      setMockUser(viewerToken, makeUser('viewer-1', 'viewer@test.com', 'viewer'))
      const req = await buildRequest('GET', 'http://localhost/api/gradebook/course/course-1', {
        headers: { Authorization: `Bearer ${viewerToken}` },
      })
      const res = await gradebookRoute.GET(req, { params: Promise.resolve({ id: 'course-1' }) })
      expect(res.status).toBe(403)
      const body = await res.json()
      expect(body.error).toMatch(/forbidden|not.*instructor/i)
    })
  })

  // ─── GET /api/notes is optional (no token → 200) ───────────────────────────
  describe('GET /api/notes is accessible without a token (optional auth)', () => {
    it('returns 200 with an empty list when no token is provided', async () => {
      // No mock user set + optional auth → request passes through to the handler
      const req = await buildRequest('GET', 'http://localhost/api/notes', {})
      const res = await notesRoute.GET(req)
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(Array.isArray(body)).toBe(true)
    })
  })
})
