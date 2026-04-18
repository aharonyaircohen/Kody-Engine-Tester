# Plan: P1T03 Build Stage — JWT Auth Migration Implementation

## Context

This task (P1T03) is the **build stage** of a Kody pipeline that tests whether HIGH complexity tasks trigger the risk gate and pause the pipeline. The task description proposes a JWT auth migration as the "complex" scenario. The plan stage ran, the risk gate fired (verified by the `kody:paused` label and `🛑 Risk gate: HIGH complexity — awaiting approval` comment in the discussion), and the auto-approve monitor has resumed the pipeline.

The `src/` codebase at `/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/src/` contains a dual auth system that needs consolidation:

1. **Legacy** (`src/auth/user-store.ts` + `src/auth/session-store.ts` + `src/api/auth/`): in-memory stores, SHA-256 password hashing
2. **JWT stack** (`src/auth/auth-service.ts` + `src/auth/jwt-service.ts` + `src/auth/withAuth.ts`): Payload DB, PBKDF2, JWT via Web Crypto API — already in use by `src/app/api/**/`

The build goal: consolidate the dual auth system by migrating `src/api/auth/` to use the JWT stack, then remove the legacy session-based files.

**Three open questions from plan stage** (awaiting user input — plan will proceed with recommended defaults):
1. `jwt_secret` — global env var (recommended) vs per-user field
2. Old store removal — delete directly (recommended) vs deprecate first
3. `UserRole` type cleanup — remove after `user-store.ts` deletion

---

## Implementation Plan

### Step 1: Read existing auth files
Read all auth files to confirm current state before making changes:
- `src/auth/user-store.ts` — legacy in-memory user store
- `src/auth/session-store.ts` — legacy session store
- `src/auth/auth-service.ts` — JWT/PBKDF2 AuthService (target)
- `src/auth/jwt-service.ts` — JWT signing/verification (target)
- `src/auth/withAuth.ts` — HOC (target)
- `src/api/auth/login.ts` — legacy login (to migrate)
- `src/api/auth/register.ts` — legacy register (to migrate)
- `src/api/auth/logout.ts` — legacy logout (to migrate)
- `src/api/auth/refresh.ts` — legacy refresh (to migrate)
- `src/api/auth/profile.ts` — legacy profile (to migrate)
- `src/utils/di-container.ts` — DI container for registering services
- `src/collections/Users.ts` — Payload Users collection

### Step 2: Migrate `src/api/auth/` routes to use JWT stack

**`src/api/auth/login.ts`** — Replace `UserStore`/`SessionStore` with `AuthService.login()`:
- Accept email + password
- Call `authService.login(email, password, ip, userAgent)`
- Return `{ accessToken, refreshToken, user }`

**`src/api/auth/register.ts`** — Replace `UserStore.create()` with `AuthService.register()`:
- Accept email + password + role
- Call `authService.register(...)`
- Return `{ accessToken, refreshToken, user }`

**`src/api/auth/logout.ts`** — Replace session store clear with `AuthService.logout()`:
- Call `authService.logout(userId)`

**`src/api/auth/refresh.ts`** — Replace session refresh with `AuthService.refresh()`:
- Call `authService.refresh(refreshToken)`
- Return `{ accessToken, refreshToken }`

**`src/api/auth/profile.ts`** — Replace `UserStore.getById()` with `AuthService.getAuthenticatedUser()`:
- Accept access token
- Call `authService.getAuthenticatedUser(userId)`
- Return user profile

### Step 3: Register `AuthService` in DI container
- Import `AuthService` from `src/auth/auth-service.ts`
- Register in `src/utils/di-container.ts` as singleton
- Export from the auth barrel: `src/auth/index.ts`

### Step 4: Update `src/auth/index.ts` barrel
- Export `AuthService`, `JwtService`, `withAuth`, `extractBearerToken`, `checkRole`, types
- Remove exports for `UserStore`/`SessionStore` (or mark deprecated)

### Step 5: Delete legacy files
Delete the following legacy session-based files (after confirming all imports are updated):
- `src/auth/user-store.ts`
- `src/auth/session-store.ts`
- `src/api/auth/login.test.ts` (legacy test)
- `src/api/auth/logout.test.ts` (legacy test)

### Step 6: Run verification
- `pnpm tsc --noEmit` — zero type errors
- `pnpm test:int` — all Vitest tests pass
- `pnpm build` — Next.js build succeeds

---

## Critical Files

| File | Action |
|------|--------|
| `src/api/auth/login.ts` | Migrate |
| `src/api/auth/register.ts` | Migrate |
| `src/api/auth/logout.ts` | Migrate |
| `src/api/auth/refresh.ts` | Migrate |
| `src/api/auth/profile.ts` | Migrate |
| `src/auth/auth-service.ts` | Reuse (target) |
| `src/auth/jwt-service.ts` | Reuse (target) |
| `src/auth/withAuth.ts` | Reuse (target) |
| `src/utils/di-container.ts` | Update (register AuthService) |
| `src/auth/index.ts` | Update (barrel exports) |
| `src/auth/user-store.ts` | Delete |
| `src/auth/session-store.ts` | Delete |

## Risks & Notes

- `src/auth/user-store.ts` and `src/auth/session-store.ts` are referenced by `src/api/auth/*` files only — safe to delete after migration
- `Users.ts` collection uses Payload built-in auth (`auth: true`) — existing `AuthService` already uses it
- No database migration needed — `AuthService` uses existing Payload Users collection
- The three open questions from plan stage will use recommended defaults (global JWT_SECRET, direct deletion, clean up types after deletion)
