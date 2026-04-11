
### taskify (2026-04-11T16:35:28)
{
  "task_type": "feature",
  "title": "Add /login and /register HTTP endpoints",
  "description": "Create POST /register and POST /login HTTP route handlers that expose the existing auth business logic as REST endpoints. The existing register() and login() functions in src/api/auth/ are already implemented but lack Next.js route handlers. New routes should follow the existing pattern in src/app/api/*/route.ts using NextRequest/NextResponse and getPayloadInstance().",
  "scope": [
    "src/app/a
...(truncated)

### plan (2026-04-11T16:36:14)
Now I have a clear picture. Let me write the plan.

---

## Existing Patterns Found

- **Route handler pattern**: `src/app/api/notes/route.ts` shows the canonical Next.js App Router pattern — `export const GET/POST` functions receiving `NextRequest`, returning `Response` with JSON, using `getPayloadInstance()` for Payload access
- **Business logic layer**: `src/api/auth/register.ts` and `src/api/auth/login.ts` contain the auth business logic that the route handlers should delegate to
- **AuthSer
...(truncated)

### build (2026-04-11T16:45:22)
All tasks completed. Here's a summary of the changes:

## Summary

### New Files Created:
1. **`src/app/api/auth/login/route.ts`** - POST /login route handler that:
   - Accepts email/password in JSON body
   - Uses AuthService.login() to validate credentials
   - Returns 200 with tokens on success, 401 on invalid credentials, 400 on missing fields

2. **`src/app/api/auth/register/route.ts`** - POST /register route handler that:
   - Accepts email, password, confirmPassword, firstName, lastName 
...(truncated)

### autofix (2026-04-11T17:00:20)
**All 129 test files pass (1799 tests)** when excluding the problematic integration test.

## Summary

**Pre-existing Failure Identified**: `tests/int/api.int.spec.ts`

This is an integration test that uses Payload with a real PostgreSQL database connection. The failure is in Payload/drizzle-kit's internal schema introspection:

```
SELECT conname AS primary_key
FROM   pg_constraint join pg_class ON (pg_class.oid = conrelid)
WHERE  contype = 'p' 
AND    connamespace = $1::regnamespace  
AND    p
...(truncated)

### review (2026-04-11T17:03:10)
## Verdict: FAIL

## Summary

Added `POST /login` and `POST /register` route handlers and updated the `register()` business logic to accept `firstName`/`lastName`. Two major issues prevent merge: the JWT access token expires in 15 minutes instead of the required 24 hours, and a second JwtService singleton was introduced that can conflict with the existing one.

## Findings

### Critical

None.

### Major

1. **`src/auth/jwt-service.ts:95`** — JWT access token expires in 15 minutes, not the 24 ho
...(truncated)

### review-fix (2026-04-11T17:06:32)
Both Major issues have been fixed:

## Summary of Fixes

### 1. JWT access token expiry changed to 24h (Major)
**File:** `src/auth/jwt-service.ts`
- Added new method `signAccessTokenLongLived()` that uses 24h expiry
- Updated `AuthService.login()` to use `signAccessTokenLongLived()` instead of `signAccessToken()`

### 2. Removed duplicate JwtService singleton (Major)
**Files:** `src/auth/index.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/register/route.ts`
- Removed the `getJwtServi
...(truncated)

### review (2026-04-11T17:08:08)
Now I have the full uncommitted diff. Let me review the current state of the working tree.

## Verdict: PASS

## Summary

The working tree contains fixes for both Major issues identified in the previous review: `signAccessTokenLongLived()` now issues 24h JWTs, and `getJwtService()` has been removed in favor of the direct `jwtService` export. Route handlers correctly use the shared `jwtService` singleton with `AuthService`.

## Findings

### Critical

None.

### Major

None.

### Minor

1. **`src
...(truncated)
