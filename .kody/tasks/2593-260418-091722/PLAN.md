# Plan: Route Auth Coverage Audit

## Context
The codebase uses a `withAuth` HOC (`src/auth/withAuth.ts`) to protect API routes. This task audits all `/api/*` routes to verify correct auth coverage, identify gaps, and document intentional exceptions.

---

## Complete API Route Audit

All route files found under `src/app/api/` and `src/app/(payload)/api/`:

### ✅ Correctly Protected Routes

| Route | Method | Auth Config | Notes |
|-------|--------|-------------|-------|
| `/api/courses/search` | GET | `withAuth({ optional: true })` | Public read, auth adds admin/editor filtering |
| `/api/enroll` | POST | `withAuth({ roles: ['viewer','admin'] })` | Correct role gate |
| `/api/dashboard/admin-stats` | GET | `withAuth({ roles: ['admin'] })` | Correct role gate |
| `/api/gradebook` | GET | `withAuth({ roles: ['viewer','admin','editor'] })` | Correct role gate |
| `/api/gradebook/course/[id]` | GET | `withAuth({ roles: ['editor','admin'] })` | Correct role gate |
| `/api/notes` | GET | `withAuth({ optional: true })` | Public read ✅ |
| `/api/notes` | POST | `withAuth({ roles: ['admin','editor'] })` | Correct role gate ✅ |
| `/api/notes/[id]` | GET | `withAuth({ optional: true })` | Public read ✅ |
| `/api/notes/[id]` | PUT | `withAuth({ roles: ['admin','editor'] })` | Correct role gate ✅ |
| `/api/notes/[id]` | DELETE | `withAuth({ roles: ['admin'] })` | Correct role gate ✅ |
| `/api/notifications` | GET | `withAuth` (no roles) | Any authenticated user ✅ |
| `/api/notifications/[id]/read` | PATCH | `withAuth` (no roles) | Any authenticated user ✅ |
| `/api/notifications/read-all` | POST | `withAuth` (no roles) | Any authenticated user ✅ |
| `/api/quizzes/[id]` | GET | `withAuth({ optional: true })` | Public read, hides correct answers ✅ |
| `/api/quizzes/[id]/submit` | POST | `withAuth` (no roles) | Any authenticated user ✅ |
| `/api/quizzes/[id]/attempts` | GET | `withAuth` (no roles) | Any authenticated user ✅ |

### ✅ Intentional Exceptions (correctly unprotected)

| Route | Reason |
|-------|--------|
| `/api/health` | Health check — must remain accessible to load balancers/monitoring |
| `/api/csrf-token` | Uses its own CSRF token mechanism via `x-session-id` header |

### ✅ Payload CMS Routes (handled by Payload's own auth)

| Route | Reason |
|-------|--------|
| `/api/graphql` | Payload CMS manages its own JWT/session auth |
| `/api/graphql-playground` | Payload-generated, dev-only |
| `/api/[...slug]` | Payload REST API with Payload-managed auth |

### ⚠️ Gap Found: `/api/my-route`

- **File**: `src/app/my-route/route.ts`
- **Issue**: `GET /api/my-route` has **no auth whatsoever** — it returns a static `{ message: '...' }` response with no authentication or authorization check
- **Intent**: Appears to be a development/example scaffold, not a real feature
- **Action**: Remove this route entirely (not a production endpoint)

### 📁 Non-Route Utility Files (not route handlers)

The files under `src/api/auth/` (`login.ts`, `register.ts`, `logout.ts`, `refresh.ts`, `profile.ts`) are **pure service utilities**, not Next.js route handlers. They export functions consumed by actual route handlers elsewhere. They do not need `withAuth`.

---

## Actions

1. **Remove** `src/app/my-route/route.ts` — unprotected dev scaffold
2. **Verify** manually (no code changes needed for the ✅ routes):
   - Unauthenticated request to any protected route → 401
   - Authenticated request with wrong role → 403
   - `/api/health` → 200 without auth
   - `/api/csrf-token` → 400 without `x-session-id`

---

## Verification

Manual test commands (run against dev server):

```bash
# Should return 401 (no token)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/enroll
# Should return 200 (health check)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health
# Should return 400 (missing x-session-id)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/csrf-token
# Should return 200 or JSON (my-route, then delete the file)
curl -s http://localhost:3000/api/my-route
```
