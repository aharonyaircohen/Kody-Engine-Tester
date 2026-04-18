# Create /login route handler using AuthService

## Context
The codebase has an `AuthService` in `src/auth/auth-service.ts` that handles JWT authentication with PBKDF2 password verification via Payload's user collection. However, there is no Next.js route handler at `src/app/api/auth/login/route.ts` — the existing `src/api/auth/login.ts` is a utility function using the older `UserStore` (SHA-256, in-memory) which is part of a dual auth anti-pattern.

This task creates the canonical login endpoint using `AuthService` so the entire auth system uses Payload's built-in auth (PBKDF2) consistently.

## Acceptance Criteria
- `POST /api/auth/login` route handler exists at `src/app/api/auth/login/route.ts`
- Accepts `email` and `password` in request body JSON
- Calls `AuthService.login()` to authenticate and return tokens
- Returns `{ accessToken, refreshToken, user }` on success
- Returns 401 for invalid credentials, 400 for missing fields
- Uses the existing `AuthService` singleton from `src/auth/withAuth.ts`

## Test Strategy
- Unit test: mock `AuthService.login` and verify request/response shape
- Integration test: POST valid credentials and verify token response
- Integration test: POST invalid credentials and verify 401 response

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2707-260418-124328`

**@aharonyaircohen** (2026-04-18):
🏗️ **Kody has architecture questions:**

1. `getAuthService()` singleton is already exported from `withAuth.ts` for reuse
2. `AuthService.login()` throws with `.status` — no `Result` type needed at the route boundary (service handles it internally)
3. `src/app/api/` is empty so no existing routes to conflict with
4. Next.js App Router convention (`src/app/api/*/route.ts`) is the correct pattern for this codebase (Next.js 16)

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `approve``

