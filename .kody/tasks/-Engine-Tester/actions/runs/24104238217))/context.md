
### taskify (2026-04-07T21:08:00)
{
  "task_type": "feature",
  "title": "Add /login and /register API endpoints",
  "description": "Create Next.js route handlers at POST /api/auth/login and POST /api/auth/register that delegate to the existing login/register functions in src/api/auth/. The login endpoint should validate credentials and return JWT tokens; the register endpoint should create a user and return JWT tokens. Both must use getPayloadInstance() for Payload and JwtService for token generation.",
  "scope": [
    "src/ap
...(truncated)

### plan (2026-04-07T21:08:36)
## Plan

### Step 1: Create `src/app/api/auth/login/route.ts`

**File:** `src/app/api/auth/login/route.ts`

**Change:** Create the file with a POST handler that parses JSON body, extracts `email`/`password`/`ipAddress`/`userAgent`, calls `login()` from `@/api/auth/login` using auth singletons from `@/auth`, and returns JWT + user or error response.

```typescript
import { NextRequest } from 'next/server'
import { login } from '@/api/auth/login'
import { userStore, sessionStore, jwtService } from
...(truncated)

### build (2026-04-07T21:12:13)
Implementation is complete. Here's a summary:

## Files Created

**`src/app/api/auth/login/route.ts`** - POST handler that:
- Parses JSON body for `email` and `password`
- Validates both fields are present (returns 400 if not)
- Extracts IP address and user agent from request headers
- Delegates to `login()` from `@/api/auth/login` using auth singletons
- Returns JWT + user on success (200), error with status code on failure

**`src/app/api/auth/register/route.ts`** - POST handler that:
- Parses
...(truncated)

### autofix (2026-04-07T21:26:11)
## Summary

I fixed the following issues:

### Fixed

1. **`tests/helpers/seedUser.ts`** - Added missing required fields to `testUser`:
   - `firstName: 'Test'`
   - `lastName: 'User'`
   - `role: 'admin' as const`
   
   The Payload `User` type requires `firstName`, `lastName`, and `role` (all `required: true` in the Users collection config), but `seedUser.ts` was only passing `email` and `password`.

2. **`src/utils/logger/index.ts:80`** - Changed `let context` to `const context` (auto-fixed b
...(truncated)

### review (2026-04-07T21:28:22)
## Verdict: PASS

## Summary

Two new API route handlers were created: `POST /api/auth/login` and `POST /api/auth/register`. The login route delegates to the existing `login()` function using auth singletons (UserStore, SessionStore, JwtService). The register route delegates to `register()` using Payload and AuthService. Both follow the existing route handler pattern and have corresponding unit tests.

## Findings

### Minor

**`src/app/api/auth/register/route.ts:14`** — Hardcoded fallback JWT s
...(truncated)
