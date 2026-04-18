# Plan: Build — Task 2650-260418-100454

## Context

**Task**: Replace the entire session-based authentication system with JWT-based authentication. Consolidate the dual auth system (UserStore/SessionStore vs AuthService/JwtService) into a single JWT-based layer. Update all API routes and middleware to use the new auth system.

**Problem**: The codebase has a dual auth system:
- `src/auth/UserStore` + `src/auth/SessionStore` — SHA-256, in-memory, session-based (OLD)
- `src/auth/AuthService` + `src/auth/JwtService` — PBKDF2, JWT, Payload-based (NEW, already implemented)

The new JWT auth (`AuthService`) already exists with full token rotation, blacklist, and refresh. API routes at `src/app/api/` already use `withAuth` which delegates to `AuthService`. The old session system is only used by:
1. `src/api/auth/login.ts` — the login utility still uses `UserStore`/`SessionStore`
2. `src/middleware/auth-middleware.ts` — still uses the old session store
3. `src/middleware/role-guard.ts` — still references `UserStore`

The `src/collections/Users.ts` Payload collection already has all required fields: `role` (admin/editor/viewer), `refreshToken`, `tokenExpiresAt`, `lastTokenUsedAt`, `lastLogin`, `permissions`.

## Implementation Steps

### Step 1: Update `src/api/auth/login.ts` to use `AuthService`

Replace the `UserStore`/`SessionStore` login with `AuthService.login()`. The new function should accept `AuthService` (not `UserStore`/`SessionStore`/`JwtService`) and delegate to `authService.login(email, password, ip, userAgent)`. Remove the SHA-256 password verification and in-memory session creation. Return the same `LoginResult` shape.

### Step 2: Refactor `src/middleware/auth-middleware.ts`

Replace `UserStore`/`SessionStore` dependency with `AuthService`. The middleware should:
- Accept `AuthService` (instead of `UserStore`/`SessionStore`/`JwtService`)
- Call `authService.verifyAccessToken(token)` to get the authenticated user
- Return `AuthContext` with the `AuthenticatedUser` from `AuthService`
- Keep the rate limiting logic

### Step 3: Update `src/middleware/role-guard.ts`

Update `requireRole()` to work with `AuthenticatedUser` from `AuthService` instead of `UserStore.User`. Keep the existing `ROLE_HIERARCHY` logic from `src/auth/_auth.ts`.

### Step 4: Run `pnpm test:int` to verify no regressions

Run the vitest integration test suite to ensure all existing auth tests pass with the updated implementations.

## Critical Files

| File | Action |
|------|--------|
| `src/api/auth/login.ts` | Update to use `AuthService` |
| `src/middleware/auth-middleware.ts` | Refactor to use `AuthService` |
| `src/middleware/role-guard.ts` | Update to use `AuthenticatedUser` |
| `src/auth/auth-service.ts` | Already complete — no changes needed |
| `src/auth/jwt-service.ts` | Already complete — no changes needed |
| `src/collections/Users.ts` | Already complete — no changes needed |

## Reused Patterns

- `AuthService.login()` — existing method, accepts email/password/ip/userAgent, returns `AuthResult`
- `AuthService.verifyAccessToken()` — existing method, accepts token, returns `{ user: AuthenticatedUser }`
- `AuthenticatedUser` type — from `src/auth/auth-service.ts`
- `ROLE_HIERARCHY` — from `src/auth/_auth.ts`

## Verification

1. `pnpm test:int` — all Vitest tests pass (auth-service, jwt-service, login tests)
2. `pnpm tsc --noEmit` — zero TypeScript errors
3. Manual: `src/api/auth/login.ts` no longer imports `UserStore` or `SessionStore`
4. Manual: `src/middleware/auth-middleware.ts` no longer imports `UserStore` or `SessionStore`
