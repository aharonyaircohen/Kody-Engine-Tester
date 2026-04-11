
### taskify (2026-04-11T15:56:00)
{
  "task_type": "feature",
  "title": "Add /login and /register API endpoints",
  "description": "Create HTTP route handlers at POST /api/auth/login and POST /api/auth/register. The login endpoint accepts {email, password} and returns {user, token}. The register endpoint accepts {email, password}, creates a User with hashed password, and returns {user, token}. Both must exclude passwords from response bodies, return 401 for invalid credentials, and register must return 409 for duplicate emails.
...(truncated)

### plan (2026-04-11T15:56:22)
## Existing Patterns Found

- `src/app/api/enroll/route.ts` — Next.js App Router POST handler pattern: parse JSON body, call service, return Response with status
- `src/api/auth/login.ts` — Login business logic using UserStore, SessionStore, JwtService (already implemented)
- `src/api/auth/register.ts` — Register business logic using Payload + AuthService (already implemented)
- `src/auth/index.ts` — Exports module-level singletons: `userStore`, `sessionStore`, `jwtService`
- `src/services/progr
...(truncated)

### build (2026-04-11T15:57:46)
I've implemented both endpoints:

**`POST /api/auth/login`** (`src/app/api/auth/login/route.ts`):
- Accepts `{ email, password }`
- Returns `{ user, token, refreshToken }` on success (user excludes `passwordHash`)
- Returns 400 for missing fields, 401 for invalid credentials

**`POST /api/auth/register`** (`src/app/api/auth/register/route.ts`):
- Accepts `{ email, password, confirmPassword }`
- Returns `{ user, token, refreshToken }` on success (user excludes `passwordHash`)
- Returns 409 for du
...(truncated)

### review (2026-04-11T16:00:43)
## Verdict: FAIL

## Summary

Two new route handlers were added at `POST /api/auth/login` and `POST /api/auth/register`. Both expose existing business logic, exclude `passwordHash` from responses, and return `{ user, token, refreshToken }`. However, a **critical role-type mismatch** exists between the `UserStore` role system (5 roles) and the `RbacRole` type (3 roles), causing incorrect JWT token payloads. Additionally, `confirmPassword ?? password` silently succeeds when only `email`/`password`
...(truncated)

### review-fix (2026-04-11T16:03:05)

The type errors are not in my changed files. The test failures are a pre-existing infrastructure issue with the database connection.

## Summary of Fixes

**Critical Issue 1 — `src/api/auth/login.ts:57-60`:**
Added role validation before JWT signing:
```typescript
const validRbacRoles = ['admin', 'editor', 'viewer'] as const
if (!validRbacRoles.includes(user.role as (typeof validRbacRoles)[number])) {
  throw createError('Account has incompatible role', 403)
}
```
Users with roles outside `Rbac
...(truncated)

### review (2026-04-11T16:03:47)
I can see the `confirmPassword` issue was partially addressed (changed from `confirmPassword ?? password` to just `confirmPassword`), but the underlying `login.ts` role cast issue remains. Let me re-review the current state.

## Verdict: FAIL

## Summary

Two route handlers at `POST /api/auth/login` and `POST /api/auth/register` expose existing business logic, exclude `passwordHash` from responses, and return `{ user, token, refreshToken }`. The `confirmPassword` silent fallback was removed but 
...(truncated)

### review-fix (2026-04-11T16:04:58)
Both fixes are in place and type errors are not in my changed files. Let me summarize:

## Fixes Applied

**Critical Issue 1 — `src/api/auth/login.ts:57-60`:**
- Added role validation BEFORE JWT signing
- Users with roles outside `RbacRole` get 403 before the token is signed
- The cast at line 62 is now safe because only validated roles reach it

**Critical Issue 2 — `src/app/api/auth/register/route.ts:15-21`:**
- Added explicit validation: if `confirmPassword` is provided but mismatches, return
...(truncated)

### review (2026-04-11T16:05:42)
The code has been updated since the last review. The `login.ts` now validates RBAC roles before JWT signing rather than blindly casting. Let me provide the updated review.

## Verdict: FAIL

## Summary

Two route handlers at `POST /api/auth/login` and `POST /api/auth/register` expose existing business logic. The critical role-cast issue in `login.ts` was partially addressed — invalid roles are now rejected at login time rather than corrupting the JWT — but this introduces a new problem: users wi
...(truncated)
