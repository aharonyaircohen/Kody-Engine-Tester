Now I have a complete picture. Let me write the plan.

## Existing Patterns Found

- **Route handler pattern** (`src/app/api/notifications/route.ts`): Next.js route handlers use `NextRequest`, return `Response` with JSON, use `getPayloadInstance()` for Payload, and follow error-first patterns
- **Auth business logic** (`src/api/auth/login.ts`, `src/api/auth/register.ts`): Already have `login()` and `register()` functions that handle the core logic
- **AuthService** (`src/auth/auth-service.ts`): Provides `login()` method using Payload + JwtService (the recommended approach)
- **Singleton exports** (`src/auth/index.ts`): Exports `jwtService` singleton instance
- **Error handling pattern**: Functions throw errors with `{ message, status }` shape
- **JWT config**: 15-minute access tokens, 7-day refresh tokens via `JwtService`

## Plan

**Step 1: Create POST /register route handler**

**File:** `src/app/api/auth/register/route.ts`
**Change:** Create route handler that parses JSON body, extracts ipAddress/userAgent from request headers, calls `register()` from `src/api/auth/register`, returns JSON response
**Why:** Exposes register business logic as HTTP endpoint
**Verify:** `pnpm test -- src/api/auth/register.test.ts`

---

**Step 2: Create POST /login route handler**

**File:** `src/app/api/auth/login/route.ts`
**Change:** Create route handler that parses JSON body, extracts ipAddress/userAgent, calls `authService.login()` using `getPayloadInstance()` and `jwtService` singleton, returns JSON response
**Why:** Exposes login business logic as HTTP endpoint
**Verify:** `pnpm test -- src/api/auth/login.test.ts`

---

**Step 3: Add tests for /register route handler**

**File:** `src/app/api/auth/register/route.test.ts`
**Change:** Create unit tests for the route handler testing success case, duplicate email (409), validation errors (400)
**Why:** TDD - tests verify the route handler behavior
**Verify:** `pnpm test -- src/app/api/auth/register/route.test.ts`

---

**Step 4: Add tests for /login route handler**

**File:** `src/app/api/auth/login/route.test.ts`
**Change:** Create unit tests for the route handler testing success case, wrong password (401), non-existent user (401), missing credentials (400)
**Why:** TDD - tests verify the route handler behavior
**Verify:** `pnpm test -- src/app/api/auth/login/route.test.ts`
