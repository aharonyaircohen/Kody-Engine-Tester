# Plan: Add Auth Middleware to Protect Existing Routes

## Context

The `withAuth` HOC exists at `src/auth/withAuth.ts` but is not applied consistently, and error messages from JWT verification and the auth service leak implementation details in 401 responses. The task is to:
1. Sanitize all auth error messages so they don't reveal internal details ("jwt expired", "User not found", "Token revoked", etc.)
2. Remove redundant `if (!user)` guards in route handlers (dead code since `withAuth` guarantees auth when roles are specified)
3. Apply `withAuth` to `/api/my-route` with `optional: true`
4. Add integration tests verifying protected endpoints reject unauthenticated/malformed requests

---

## Step 1: Sanitize error messages in `withAuth`

**File: `src/auth/withAuth.ts`**

Currently leaks:
- JWT verification errors: "jwt expired", "Token revoked", "Invalid token signature", "Invalid token format"
- Auth service errors: "User not found", "Account is inactive"

**Changes:**
- Wrap the entire `verifyAccessToken` call in try/catch and return a generic `"Authentication failed"` message
- If `authContext.error` exists (e.g., "User not found"), return a generic `"Authentication failed"` instead
- The catch block at line 94–97 already leaks `err.message` — change to `Response.json({ error: 'Authentication failed' }, { status: 401 })`

```typescript
// Before (leaks internals):
catch (err) {
  const message = err instanceof Error ? err.message : 'Invalid token'
  return Response.json({ error: message }, { status: 401 })
}

// After:
catch () {
  return Response.json({ error: 'Authentication failed' }, { status: 401 })
}
```

And at lines 100–103:
```typescript
// Before:
if (authContext.error) {
  return Response.json({ error: authContext.error }, ...)

// After:
if (authContext.error) {
  return Response.json({ error: 'Authentication failed' }, { status: 401 })
}
```

---

## Step 2: Sanitize error messages in `AuthService.verifyAccessToken`

**File: `src/auth/auth-service.ts`**

Change error messages to be opaque:

- Line 172 (`'User not found'`): Change to a generic error — but this error is thrown with a status code so we can't easily change it without affecting other uses. Instead, the `withAuth` layer now catches all auth errors and returns a generic message. No change needed in `auth-service.ts` for the error message itself since `withAuth` sanitizes at the boundary.
- The `withAuth` catch block is the right place to sanitize, since it wraps all auth errors.

---

## Step 3: Remove redundant `if (!user)` guards from route files

The following 8 routes have `if (!user)` guards that are **dead code** — `withAuth` with `roles` already guarantees `user` is set. Remove them:

| File | Line |
|------|------|
| `src/app/api/notes/route.ts` | POST handler (lines 53–59) |
| `src/app/api/enroll/route.ts` | POST handler (lines 7–12) |
| `src/app/api/gradebook/route.ts` | GET handler (lines 11–17) |
| `src/app/api/notifications/route.ts` | GET handler (lines 7–12) |
| `src/app/api/notifications/read-all/route.ts` | POST handler (lines 7–12) |
| `src/app/api/quizzes/[id]/attempts/route.ts` | GET handler (lines 12–17) |
| `src/app/api/quizzes/[id]/submit/route.ts` | POST handler (lines 13–18) |

Also in `src/app/api/gradebook/course/[id]/route.ts`, line 47 uses `user?.role` (optional chaining) which suggests uncertainty about auth — can be simplified to `user.role`.

---

## Step 4: Protect `/api/my-route` with `withAuth`

**File: `src/app/my-route/route.ts`**

Currently unprotected (no `withAuth`). Apply with `optional: true` since it's a public example route:

```typescript
import { withAuth } from '@/auth/withAuth'
export const GET = withAuth(async (_request: Request) => {
  return Response.json({ message: 'This is an example of a custom route.' })
}, { optional: true })
```

---

## Step 5: Add integration test file

**File: `tests/int/auth-middleware.int.spec.ts`** (new)

Test all protected endpoints against unauthenticated and malformed requests. Uses `JwtService` directly to generate valid and malformed tokens.

Tests:
1. `POST /api/notes` — no auth → 401
2. `POST /api/notes` — malformed JWT → 401
3. `POST /api/notes` — valid JWT with `viewer` role → 403 (correctly rejected for wrong role)
4. `POST /api/enroll` — no auth → 401
5. `POST /api/enroll` — malformed JWT → 401
6. `GET /api/gradebook` — no auth → 401
7. `GET /api/gradebook/course/:id` — no auth → 401
8. `GET /api/notifications` — no auth → 401
9. `PATCH /api/notifications/:id/read` — no auth → 401
10. `POST /api/notifications/read-all` — no auth → 401
11. `GET /api/quizzes/:id/attempts` — no auth → 401
12. `POST /api/quizzes/:id/submit` — no auth → 401
13. `GET /api/my-route` — no auth → passes through (optional)
14. `GET /api/notes` — no auth → passes through (optional)

Helper: `createValidToken(role)` using `JwtService` to generate real tokens with the test secret.

---

## Summary of Changes

| File | Action |
|------|--------|
| `src/auth/withAuth.ts` | Sanitize error messages to "Authentication failed" |
| `src/app/api/notes/route.ts` | Remove redundant `if (!user)` in POST |
| `src/app/api/enroll/route.ts` | Remove redundant `if (!user)` in POST |
| `src/app/api/gradebook/route.ts` | Remove redundant `if (!user)` in GET |
| `src/app/api/gradebook/course/[id]/route.ts` | Remove optional chaining on `user?.role` |
| `src/app/api/notifications/route.ts` | Remove redundant `if (!user)` in GET |
| `src/app/api/notifications/read-all/route.ts` | Remove redundant `if (!user)` in POST |
| `src/app/api/quizzes/[id]/attempts/route.ts` | Remove redundant `if (!user)` in GET |
| `src/app/api/quizzes/[id]/submit/route.ts` | Remove redundant `if (!user)` in POST |
| `src/app/my-route/route.ts` | Add `withAuth({ optional: true })` |
| `tests/int/auth-middleware.int.spec.ts` | New integration test file |

## Verification

```bash
# Run typecheck
pnpm tsc --noEmit

# Run all tests
pnpm test:int
```
