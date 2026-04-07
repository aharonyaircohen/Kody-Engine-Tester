
### taskify (2026-04-07T21:54:03)
```json
{
  "task_type": "refactor",
  "title": "Refactor auth system: JWT replacing sessions, add RBAC roles array",
  "description": "Replace session-based auth with stateless JWT, migrate User schema from single `role` to `roles: RbacRole[]` array, consolidate RBAC into new src/middleware/rbac.ts, update all API auth handlers (login/logout/refresh/profile/register) to use pure JWT, and provide a migration script. Current issues: session-store.ts stores tokens server-side but JWT is already av
...(truncated)

### plan (2026-04-07T21:55:11)
Now I have a comprehensive understanding of the codebase. Let me write the plan.

## Existing Patterns Found

- **JwtService** (`src/auth/jwt-service.ts`): Stateless JWT sign/verify/blacklist — already the backbone of the new auth; `signAccessToken(15min)` and `signRefreshToken(7days)` already exist
- **AuthService** (`src/auth/auth-service.ts`): Payload-backed login/refresh/logout using JwtService — already stateless (stores only `refreshToken` on user doc, not session); uses `RbacRole = 'admin
...(truncated)

### build (2026-04-07T22:05:53)
## Summary

I've completed the auth system refactor. Here's what was done:

### Changes Made

1. **`src/collections/Users.ts`** - Added `roles` field (array of RbacRole) alongside existing `role` field for backwards compatibility

2. **`src/auth/auth-service.ts`** - Added `getPrimaryRole()` helper that checks `roles[0]` first, falls back to `role`, then to `'viewer'`. Updated `login()` and `verifyAccessToken()` to use this helper.

3. **`src/middleware/auth-middleware.ts`** - Removed SessionStor
...(truncated)

### review (2026-04-07T22:11:17)
## Verdict: PASS

## Summary

The auth system refactor successfully replaces session-based auth with pure JWT tokens. Key changes: deleted `SessionStore` and `SessionCard`, added `roles` array field to Users collection with migration, created new RBAC middleware (`rbac.ts`), and updated `AuthService` with `getPrimaryRole()` helper for backwards compatibility.

## Findings

### Critical
None.

### Major
None.

### Minor

1. `src/pages/auth/profile.tsx:88` — Missing newline at end of file. Cosmeti
...(truncated)

### review-fix (2026-04-07T22:13:42)
## Review-Fix Complete

**Review verdict:** PASS - No Critical/Major issues found.

**Minor issue fixed:**
- `src/pages/auth/profile.tsx` - Added missing trailing newline at end of file

**Browser verification:**
- `/` - Root page renders correctly (Payload welcome page)
- `/auth/login` - Login page renders correctly with email/password form

**TypeScript:** No errors in auth-related files.

The auth system refactor is complete. All Critical/Major findings from the review were addressed during t
...(truncated)
