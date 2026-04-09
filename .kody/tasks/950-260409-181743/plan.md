Now I have a clear picture. The existing `src/middleware/auth-middleware.ts` is an Express-style utility, not a Next.js App Router middleware. The task requires creating an actual `middleware.ts` at the project root.

Let me write the implementation plan.

## Existing Patterns Found

- **`src/auth/jwt-service.ts`**: `JwtService.verify()` validates JWT signature and expiration (stateless, works on edge)
- **`src/auth/_auth.ts`**: `extractBearerToken()` helper for parsing Bearer tokens
- **`src/middleware/request-logger.ts`** and **`rate-limiter.ts`**: Show the factory pattern for creating Next.js middleware functions
- **`src/middleware/auth-middleware.test.ts`**: Existing comprehensive tests for auth middleware

## Plan

### Step 1: Create `middleware.ts` at project root

**File:** `middleware.ts` (project root)
**Change:** Create Next.js App Router middleware that validates JWT tokens and protects routes
**Why:** Next.js App Router requires `middleware.ts` at the project root to intercept requests
**Verify:** `pnpm test:int` passes

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { JwtService } from './src/auth/jwt-service'
import { extractBearerToken } from './src/auth/_auth'

const jwtService = new JwtService(process.env.JWT_SECRET || 'dev-secret-do-not-use-in-production')

export interface AuthMiddlewareConfig {
  protectedRoutes?: string[]
  publicRoutes?: string[]
}

const DEFAULT_PROTECTED_ROUTES = ['/api/notes', '/api/gradebook', '/api/enroll', '/api/notifications']
const DEFAULT_PUBLIC_ROUTES = ['/api/health', '/api/csrf-token', '/api/courses/search']

export function createAuthMiddleware(config: AuthMiddlewareConfig = {}) {
  const protectedRoutes = config.protectedRoutes ?? DEFAULT_PROTECTED_ROUTES
  const publicRoutes = config.publicRoutes ?? DEFAULT_PUBLIC_ROUTES

  return function authMiddleware(request: NextRequest): NextResponse {
    const pathname = request.nextUrl.pathname

    // Skip public routes
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.next()
    }

    // Check if route requires protection
    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))
    if (!isProtected) {
      return NextResponse.next()
    }

    // Extract token
    const authHeader = request.headers.get('authorization')
    const token = extractBearerToken(authHeader)

    if (!token) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      )
    }

    // Validate token
    try {
      const payload = jwtService.verify(token)

      // Attach user info to headers for downstream use
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', payload.userId)
      requestHeaders.set('x-user-email', payload.email)
      requestHeaders.set('x-user-role', payload.role)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid token'
      return NextResponse.json({ error: message }, { status: 401 })
    }
  }
}

export const config = {
  matcher: ['/api/:path*'],
}

export default createAuthMiddleware()
```

---

### Step 2: Create `src/middleware/index.ts`

**File:** `src/middleware/index.ts`
**Change:** Export the auth middleware factory and types for reuse
**Why:** Provides a single entry point for middleware exports
**Verify:** `pnpm test:int` passes

```typescript
export { createAuthMiddleware } from '../../middleware'
export type { AuthMiddlewareConfig } from '../../middleware'
```

Wait - I should just export directly from the `middleware.ts` file. Let me simplify:

### Step 1 (revised): Create `middleware.ts` at project root

**File:** `middleware.ts` (project root)
**Change:** Create Next.js App Router middleware that validates JWT tokens and protects routes
**Why:** Next.js App Router requires `middleware.ts` at the project root to intercept requests
**Verify:** `pnpm test:int` passes

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { JwtService } from './src/auth/jwt-service'
import { extractBearerToken } from './src/auth/_auth'

const jwtService = new JwtService(process.env.JWT_SECRET || 'dev-secret-do-not-use-in-production')

export interface AuthMiddlewareConfig {
  protectedRoutes?: string[]
  publicRoutes?: string[]
}

const DEFAULT_PROTECTED_ROUTES = ['/api/notes', '/api/gradebook', '/api/enroll', '/api/notifications']
const DEFAULT_PUBLIC_ROUTES = ['/api/health', '/api/csrf-token', '/api/courses/search']

export function createAuthMiddleware(config: AuthMiddlewareConfig = {}) {
  const protectedRoutes = config.protectedRoutes ?? DEFAULT_PROTECTED_ROUTES
  const publicRoutes = config.publicRoutes ?? DEFAULT_PUBLIC_ROUTES

  return function authMiddleware(request: NextRequest): NextResponse {
    const pathname = request.nextUrl.pathname

    // Skip public routes
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.next()
    }

    // Check if route requires protection
    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))
    if (!isProtected) {
      return NextResponse.next()
    }

    // Extract token
    const authHeader = request.headers.get('authorization')
    const token = extractBearerToken(authHeader)

    if (!token) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      )
    }

    // Validate token
    try {
      const payload = jwtService.verify(token)

      // Attach user info to headers for downstream use
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', payload.userId)
      requestHeaders.set('x-user-email', payload.email)
      requestHeaders.set('x-user-role', payload.role)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid token'
      return NextResponse.json({ error: message }, { status: 401 })
    }
  }
}

export const config = {
  matcher: ['/api/:path*'],
}

export default createAuthMiddleware()
```

---

### Step 2: Add unit tests for token extraction

**File:** `src/middleware/auth-middleware.test.ts`
**Change:** Add tests for `extractBearerToken` function with various header formats
**Why:** Per the task's test strategy: "Unit tests for token extraction from various header formats"
**Verify:** `pnpm test:int src/middleware/auth-middleware.test.ts` passes

### Step 3: Add unit tests for token validation

**File:** `src/middleware/auth-middleware.test.ts`
**Change:** Add tests for token validation scenarios (valid, expired, malformed, wrong signature)
**Why:** Per the task's test strategy: "Unit tests for token validation (valid, expired, malformed, wrong signature)"
**Verify:** `pnpm test:int src/middleware/auth-middleware.test.ts` passes

---

## Questions

1. **Should middleware replace withAuth HOC or work alongside it?** The existing `withAuth` HOC performs full auth including user lookup in Payload DB. The middleware only validates JWT stateless. Recommend: middleware handles gate-keeping (401 for missing/invalid), withAuth handles user lookup and RBAC for fine-grained control.

2. **Which routes should be protected by default?** Based on the task description's mention of health check endpoint and the existing API routes, recommend: protect `/api/notes`, `/api/gradebook`, `/api/enroll`, `/api/notifications`; exclude `/api/health`, `/api/csrf-token`, `/api/courses/search` (public search). Should `/api/quizzes/[id]/submit` be protected?

3. **Session store validation** - The existing `createAuthMiddleware` checks session store for token revocation. Should the Next.js middleware also check for revoked sessions, or rely on short-lived access tokens (15 min) and let the withAuth HOC handle session validation?
