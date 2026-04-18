# Plan: Add Auth Middleware to Protect Existing API Routes

## Context
The codebase has an existing `withAuth` HOC (`src/auth/withAuth.ts`) that wraps route handlers with JWT validation and RBAC checks. All routes are already wrapped with `withAuth`, but there are two concrete issues:

1. **401 message inconsistency**: `withAuth` returns `"Missing or invalid Authorization header"` instead of the required `"Unauthorized"`
2. **Dead `if (!user)` blocks**: Since `withAuth` guarantees a user exists when the handler runs (for non-optional auth), manual user-existence checks are dead code and should be removed

---

## Changes

### 1. Fix 401 message — `src/auth/withAuth.ts` (line 72)

```diff
- { error: 'Missing or invalid Authorization header' },
+ { error: 'Unauthorized' },
```

### 2. Remove dead `if (!user)` blocks — routes where `withAuth` guarantees auth

| File | Handler | Why dead |
|------|---------|---------|
| `src/app/api/notes/route.ts` | POST | `withAuth({ roles: ['admin','editor'] })` guarantees user |
| `src/app/api/quizzes/[id]/submit/route.ts` | POST | `withAuth()` guarantees user |
| `src/app/api/quizzes/[id]/attempts/route.ts` | GET | `withAuth()` guarantees user |
| `src/app/api/enroll/route.ts` | POST | `withAuth({ roles: ['viewer','admin'] })` guarantees user |
| `src/app/api/gradebook/route.ts` | GET | `withAuth({ roles: ['viewer','admin','editor'] })` guarantees user |
| `src/app/api/gradebook/course/[id]/route.ts` | GET | `withAuth({ roles: ['editor','admin'] })` guarantees user |
| `src/app/api/notifications/route.ts` | GET | `withAuth()` guarantees user |
| `src/app/api/notifications/read-all/route.ts` | POST | `withAuth()` guarantees user |
| `src/app/api/dashboard/admin-stats/route.ts` | GET | `withAuth({ roles: ['admin'] })` guarantees user |

**Note**: `PATCH /api/notifications/[id]/read` uses `withAuth()` without `optional`, so its `if (!user)` is also dead — but since no `roles` are specified and the context type signature accepts `user?: AuthenticatedUser`, the defensive guard is kept as a safety net.

### 3. Remove redundant role-check blocks

| File | Handler | Reason |
|------|---------|--------|
| `src/app/api/notes/route.ts` | POST | `withAuth({ roles: ['admin','editor'] })` already enforces this |
| `src/app/api/enroll/route.ts` | POST | `withAuth({ roles: ['viewer','admin'] })` already enforces this |
| `src/app/api/dashboard/admin-stats/route.ts` | GET | `withAuth({ roles: ['admin'] })` already enforces this |

---

## Files Modified

- `src/auth/withAuth.ts` — 401 message fix
- `src/app/api/notes/route.ts` — remove dead `if (!user)` + dead role-check
- `src/app/api/quizzes/[id]/submit/route.ts` — remove dead `if (!user)`
- `src/app/api/quizzes/[id]/attempts/route.ts` — remove dead `if (!user)`
- `src/app/api/enroll/route.ts` — remove dead `if (!user)` + dead role-check
- `src/app/api/gradebook/route.ts` — remove dead `if (!user)`
- `src/app/api/gradebook/course/[id]/route.ts` — remove dead `if (!user)` + dead role-check
- `src/app/api/notifications/route.ts` — remove dead `if (!user)`
- `src/app/api/notifications/read-all/route.ts` — remove dead `if (!user)`
- `src/app/api/dashboard/admin-stats/route.ts` — remove dead `if (!user)` + dead role-check

---

## Verification

1. `pnpm tsc --noEmit` — zero type errors
2. `pnpm test:int` — all Vitest tests pass
3. Manual: call a protected endpoint without token → verify 401 with `{ "error": "Unauthorized" }`
4. Manual: call a protected endpoint with valid admin token → verify 200
5. Manual: call `/api/health` without token → verify it stays public (200)
