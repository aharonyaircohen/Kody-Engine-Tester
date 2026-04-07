Now I have a complete picture. Let me write the plan.

## Existing Patterns Found

- **`src/middleware/rate-limiter.ts`**: Factory pattern that returns a `(request: NextRequest) => NextResponse` middleware function — the exact `NextMiddleware` signature the task requires
- **`src/auth/_auth.ts`**: `extractBearerToken` helper and `checkRole` function for JWT extraction and role validation
- **`src/auth/jwt-service.ts`**: JWT signing and verification with `signAccessToken` / `verify` methods
- **`tests/int/api.int.spec.ts`**: Integration test pattern using Payload initialization with `beforeAll`

---

## Step 1: Create `src/middleware/rbac.ts` with `requireRole` factory

**File:** `src/middleware/rbac.ts`  
**Change:** New file — implement `requireRole` as a Next.js middleware factory that extracts JWT from `Authorization: Bearer <token>`, verifies it via `JwtService`, and returns 403 if the user's role is not in the allowed set.

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { JwtService } from '@/auth/jwt-service'
import { ROLE_HIERARCHY } from '@/auth/_auth'
import type { RbacRole } from '@/auth/auth-service'

type NextMiddleware = (request: NextRequest) => NextResponse

// Module-level singleton for JwtService (matches existing pattern in withAuth.ts)
let _jwtService: JwtService | null = null

function getJwtService(): JwtService {
  if (!_jwtService) {
    _jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
  }
  return _jwtService
}

export function requireRole(...roles: RbacRole[]): NextMiddleware {
  return function rbacMiddleware(request: NextRequest): NextResponse {
    const authHeader = request.headers.get('authorization')
    const token = extractBearerToken(authHeader)

    if (!token) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 })
    }

    let payload: { userId: string; email: string; role: RbacRole; sessionId: string; generation: number; iat: number; exp: number }
    try {
      payload = getJwtService().verify(token) as any
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid token'
      return NextResponse.json({ error: message }, { status: 401 })
    }

    const userRole = payload.role
    if (!userRole) {
      return NextResponse.json({ error: 'User role not configured' }, { status: 401 })
    }

    const userRoleLevel = ROLE_HIERARCHY[userRole]
    const hasSufficientRole = roles.some((requiredRole) => userRoleLevel >= ROLE_HIERARCHY[requiredRole])

    if (!hasSufficientRole) {
      return NextResponse.json(
        { error: `Forbidden: requires role ${roles.join(' or ')}` },
        { status: 403 }
      )
    }

    return NextResponse.next()
  }
}

function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}
```

**Why:** Implements the exact `requireRole(...roles: string[]): NextMiddleware` signature from the task. Uses `JwtService.verify` directly to check token validity and role. Returns `NextResponse.json` for auth errors, `NextResponse.next()` for authorized requests — matching the middleware chain pattern from `rate-limiter.ts`.  
**Verify:** `pnpm tsc --noEmit` passes

---

## Step 2: Create `tests/int/rbac.int.spec.ts` with integration tests

**File:** `tests/int/rbac.int.spec.ts`  
**Change:** New file — integration tests covering: valid role (200), invalid role (403), missing token (401), expired token (401).

```typescript
import { describe, it, expect, beforeAll } from 'vitest'
import { JwtService } from '@/auth/jwt-service'
import { requireRole } from '@/middleware/rbac'
import type { RbacRole } from '@/auth/auth-service'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production'

let jwtService: JwtService

beforeAll(() => {
  jwtService = new JwtService(JWT_SECRET)
})

function makeRequest(token?: string | null, method = 'GET'): NextRequest {
  const req = new NextRequest('http://localhost/api/test', { method })
  if (token !== undefined) {
    req.headers.set('authorization', `Bearer ${token}`)
  }
  return req
}

async function createToken(role: RbacRole, expired = false): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const exp = expired ? now - 3600 : now + 3600 // expired 1h ago, valid 1h from now
  return jwtService.sign(
    { userId: 'user-1', email: 'test@example.com', role, sessionId: 'sess-1', generation: 0 },
    3600 * 1000
  )
}

describe('requireRole middleware', () => {
  it('allows request when user has required role (admin)', async () => {
    const token = await createToken('admin')
    const middleware = requireRole('admin')
    const response = await middleware(makeRequest(token))
    expect(response.status).toBe(200) // NextResponse.next() = 200 implicit
  })

  it('allows request when user has one of multiple allowed roles (editor)', async () => {
    const token = await createToken('editor')
    const middleware = requireRole('admin', 'editor')
    const response = await middleware(makeRequest(token))
    expect(response.status).toBe(200)
  })

  it('allows admin to access editor-protected route (hierarchical)', async () => {
    const token = await createToken('admin')
    const middleware = requireRole('editor')
    const response = await middleware(makeRequest(token))
    expect(response.status).toBe(200)
  })

  it('returns 403 when user lacks required role', async () => {
    const token = await createToken('viewer')
    const middleware = requireRole('admin', 'editor')
    const response = await middleware(makeRequest(token))
    expect(response.status).toBe(403)
    const body = await response.json()
    expect(body.error).toContain('Forbidden')
  })

  it('returns 401 when no token is provided', async () => {
    const middleware = requireRole('admin')
    const response = await middleware(makeRequest(null))
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toContain('Missing or invalid Authorization header')
  })

  it('returns 401 when token is invalid', async () => {
    const middleware = requireRole('admin')
    const response = await middleware(makeRequest('invalid-token'))
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toContain('Invalid token')
  })

  it('returns 401 when token is expired', async () => {
    const token = await createToken('admin', true) // expired
    const middleware = requireRole('admin')
    const response = await middleware(makeRequest(token))
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toContain('Token expired')
  })
})
```

**Why:** Follows the integration test pattern from `tests/int/api.int.spec.ts` (uses `beforeAll` for setup). Covers all four acceptance criteria cases. Uses real `JwtService` for token creation/verification — no mocks.  
**Verify:** `pnpm test:int rbac.int` passes

---

## Step 3: Update gradebook route to use `requireRole` middleware

**File:** `src/app/api/gradebook/course/[id]/route.ts`  
**Change:** Replace the `withAuth` HOC wrapper with `requireRole` middleware applied inline. The route currently uses `withAuth(handler, { roles: ['editor', 'admin'] })` — refactor to use the new middleware while preserving the course-ownership check logic.

```typescript
import { NextRequest, NextResponse } from 'next/server'
import type { CollectionSlug } from 'payload'
import { requireRole } from '@/middleware/rbac'
import { getPayloadInstance } from '@/services/progress'
import { PayloadGradebookService } from '@/services/gradebook-payload'

/**
 * GET /api/gradebook/course/:id
 * Returns all students' grades for a specific course.
 * Requires editor role (must be the course editor) or admin.
 */
export const GET = async (
  request: NextRequest,
  routeParams?: { params: Promise<{ id: string }> },
) => {
  // Apply RBAC middleware inline
  const rbacMiddleware = requireRole('admin', 'editor')
  const rbacResponse = rbacMiddleware(request)
  if (rbacResponse.status !== 200) {
    return rbacResponse
  }

  const params = await routeParams?.params
  const courseId = params?.id

  if (!courseId) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
  }

  const payload = await getPayloadInstance()

  const course = (await payload.findByID({
    collection: 'courses' as CollectionSlug,
    id: courseId,
    depth: 0,
  })) as unknown as { instructor?: { id: string } | string; id: string }

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  // Note: The RBAC middleware has already verified admin/editor role.
  // The course-ownership check below is still needed because being an
  // editor alone doesn't mean you can access any course — you must be
  // the instructor of THIS course (unless you're admin).

  const courseInstructorId =
    typeof course.instructor === 'string' ? course.instructor : course.instructor?.id

  // Get user from JWT (the middleware decoded it but doesn't attach user to request)
  // For the ownership check we need the userId — read from Authorization header
  // Re-verify to get userId (middleware already did this, but doesn't expose userId)
  // Alternative: have requireRole return user context — for now, re-extract
  // This is a limitation; the withAuth HOC is better suited when route handler
  // needs the actual user object.
  //
  // Since the course ownership check requires knowing who the user is, and
  // requireRole only returns 200/403 without user context, we need to either:
  // (a) modify requireRole to attach user to request headers, or
  // (b) keep withAuth and rely on its role check for the basic admin/editor guard
  //
  // Decision: revert to withAuth for the route, but keep rbac.ts as the standalone
  // middleware for cases where the route handler doesn't need user context.

  return NextResponse.json({ error: 'Not implemented: requires withAuth for user context' }, { status: 501 })
}
```

Actually, this reveals a problem. The `requireRole` middleware as designed can't pass the decoded user to the route handler — it only returns 200/403. The `withAuth` HOC is better because it passes `{ user }` to the handler. The `requireRole` middleware is useful for pure middleware-level protection (where the route doesn't need user details), but for the gradebook endpoint that needs the userId for ownership checks, `withAuth` is the right tool.

**Revised approach for Step 3:**

The task asks to update the route to use `requireRole`. Since `requireRole` is a pure middleware (no user context passed to handler), and the gradebook route needs user context for course ownership checks, the cleanest solution is to have `requireRole` attach the decoded user to request headers so downstream handlers can read it.

**Update `src/middleware/rbac.ts`** to attach user payload to `x-user-id` and `x-user-role` headers on success:

```typescript
export function requireRole(...roles: RbacRole[]): NextMiddleware {
  return function rbacMiddleware(request: NextRequest): NextResponse {
    // ... JWT verification ...

    // Attach user info to headers for downstream handlers
    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.userId)
    response.headers.set('x-user-role', payload.role)
    return response
  }
}
```

Then in the route handler, read `x-user-id` header for ownership check instead of via `withAuth` context.

**Updated Step 3 — `src/app/api/gradebook/course/[id]/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import type { CollectionSlug } from 'payload'
import { requireRole } from '@/middleware/rbac'
import { getPayloadInstance } from '@/services/progress'
import { PayloadGradebookService } from '@/services/gradebook-payload'

/**
 * GET /api/gradebook/course/:id
 * Returns all students' grades for a specific course.
 * Requires admin or editor role.
 */
export const GET = async (
  request: NextRequest,
  routeParams?: { params: Promise<{ id: string }> },
) => {
  const rbacResponse = requireRole('admin', 'editor')(request)
  if (rbacResponse.status !== 200) {
    return rbacResponse
  }

  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role')

  const params = await routeParams?.params
  const courseId = params?.id

  if (!courseId) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
  }

  const payload = await getPayloadInstance()

  const course = (await payload.findByID({
    collection: 'courses' as CollectionSlug,
    id: courseId,
    depth: 0,
  })) as unknown as { instructor?: { id: string } | string; id: string }

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  const courseInstructorId =
    typeof course.instructor === 'string' ? course.instructor : course.instructor?.id

  if (userRole !== 'admin' && courseInstructorId !== userId) {
    return NextResponse.json(
      { error: 'Forbidden: you are not the editor of this course' },
      { status: 403 }
    )
  }

  const gradebookSvc = new PayloadGradebookService(payload)
  const gradebook = await gradebookSvc.getCourseGradebook(courseId)

  return NextResponse.json(gradebook, { status: 200 })
}
```

**Why:** The route now uses `requireRole` middleware as specified. User context is passed via headers set by the middleware. Admin bypasses ownership check; editors can only access courses they own.  
**Verify:** `pnpm test:int` passes

---

## Questions

- **Middleware user context pattern**: The `requireRole` middleware sets user info headers (`x-user-id`, `x-user-role`) for downstream handlers. Is this the preferred pattern, or should `requireRole` return a different structure that the route handler can use? An alternative is to have the middleware attach to the request object directly (via `NextRequest` headers or a custom property), but Next.js middleware can't mutate the request object passed to handlers — only headers can be set.
- **Should `requireRole` support optional auth** (allow request through even if no token, like `withAuth({ optional: true })`)? The task doesn't specify, and the current implementation always requires a token.
