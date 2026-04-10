Now I have a clear picture. Let me write the plan.

## Existing Patterns Found

- **`src/auth/withAuth.ts`**: HOC wrapper for Next.js route handlers with JWT validation — the standard auth pattern in this codebase
- **`src/middleware/request-logger.ts`**: Next.js middleware factory using `NextRequest`/`NextResponse`
- **`src/app/api/health/route.test.ts`**: Integration test pattern — calls route handler directly with `NextRequest`
- **`src/app/api/notes/route.ts`**: Example of protected route using `withAuth` HOC

The `auth-middleware.ts` is a standalone middleware factory (not Next.js specific) but is **not used by any route**. The task requires a protected route example and integration tests.

---

## Plan

### Step 1: Add integration test for `my-route/route.ts` with auth

**File:** `src/app/my-route/route.test.ts`
**Change:** Create integration tests that call the protected route with and without token
**Why:** The acceptance criteria explicitly requires "Integration test: call a protected endpoint with and without token"
**Verify:** `pnpm vitest run src/app/my-route/route.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { GET } from './route'

describe('GET /my-route', () => {
  it('returns 200 without auth (currently unprotected)', async () => {
    const response = await GET(new Request('http://localhost/my-route'))
    expect(response.status).toBe(200)
  })
})
```

### Step 2: Update `my-route/route.ts` to use `withAuth` HOC

**File:** `src/app/my-route/route.ts`
**Change:** Wrap the GET handler with `withAuth` and return `userId`/`email` in response to demonstrate auth works
**Why:** Provides a clear protected route example that meets acceptance criteria — attaches `req.user = {userId, email}` on success
**Verify:** `pnpm vitest run src/app/my-route/route.test.ts`

```typescript
import { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'

export const GET = withAuth(async (request: NextRequest, { user }) => {
  return Response.json({
    message: 'This is an example of a protected route.',
    user: { userId: user?.id, email: user?.email },
  })
})
```

### Step 3: Verify full test suite passes

**Command:** `pnpm vitest run src/app/my-route/route.test.ts src/middleware/auth-middleware.test.ts`

---

## Summary

The `auth-middleware.ts` factory exists and has unit tests covering missing header, malformed token, expired token, and valid token. The missing pieces per acceptance criteria are:

1. **Integration test** calling a protected endpoint — added in Step 1
2. **Protected route example** demonstrating usage — updated in Step 2

The `withAuth` HOC is the codebase-standard pattern (not the raw `createAuthMiddleware` factory), so using it for the protected route example aligns with existing conventions.
