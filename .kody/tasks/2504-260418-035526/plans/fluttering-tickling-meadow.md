# Plan: Create `/api/auth/login` and `/api/auth/register` Route Handlers

## Context

The codebase has:
- `src/api/auth/login.ts` — pure function using `UserStore` (in-memory, not Payload-based)
- `src/api/auth/register.ts` — pure function using `Payload` + `AuthService`
- `src/auth/auth-service.ts` — Payload-based login via PBKDF2 password hashing
- Existing Next.js route handlers in `src/app/api/*/route.ts` using `getPayloadInstance()`

There are **no Next.js route handlers** exposing `/api/auth/login` or `/api/auth/register`. The task requires:
1. `POST /api/auth/login` → returns `{ accessToken, refreshToken, user }`
2. `POST /api/auth/register` → creates user via Payload, returns tokens + user

The route handlers must delegate to `AuthService.login()` per acceptance criteria. The `src/api/auth/login.ts` (UserStore-based) is kept as-is for backward compatibility with its existing tests.

---

## Files to Create / Modify

### 1. `src/app/api/auth/login/route.ts` *(NEW)*

Next.js route handler wrapping `AuthService.login()`. Pattern matches existing `src/app/api/*/route.ts` files.

```typescript
import { NextRequest } from 'next/server'
import { getPayloadInstance } from '@/services/progress'
import { getJwtService } from '@/auth'
import { AuthService } from '@/auth/auth-service'

export const POST = publicHandler(async (req: NextRequest) => {
  const payload = await getPayloadInstance()
  const jwtService = getJwtService()
  const authService = new AuthService(payload as any, jwtService)

  const { email, password } = await req.json()

  try {
    const result = await authService.login(email, password, '', '')
    return Response.json(result, { status: 200 })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: err.status || 500 })
  }
})
```

### 2. `src/app/api/auth/register/route.ts` *(NEW)*

Next.js route handler for user registration. Wraps `register()` from `src/api/auth/register.ts`.

Needs to pass `firstName` + `lastName` to the register function. Current `register()` only passes `email, password` to Payload — needs updating to include `firstName, lastName`.

### 3. `src/api/auth/register.ts` *(MODIFY)*

Update `register()` to accept `firstName` and `lastName` and pass them to Payload when creating the user. Also update the `payload.create` call to include these fields.

**Change:** Add `firstName: string` and `lastName: string` to function params. Update `payload.create` data to include `firstName`, `lastName`.

### 4. `src/api/auth/login.test.ts` *(MODIFY — rewrite)*

Rewrite existing unit test file to test `AuthService`-based login (the new route handler behavior), matching the mock pattern from `register.test.ts`:
- Mock `@/getPayload` → `getPayloadInstance`
- Mock `crypto` for PBKDF2
- Test successful login, invalid credentials (401), missing fields (400)

### 5. `src/api/auth/register.test.ts` *(MODIFY)*

Update to pass `firstName` and `lastName` arguments. Update mock Payload `create` call to verify `firstName`/`lastName` are included. Add test for missing `firstName`/`lastName` → 400.

### 6. `tests/int/auth/login.int.spec.ts` *(NEW)*

Integration test for `POST /api/auth/login` route handler:
- `POST /api/auth/login` with valid credentials → 200 + `{ accessToken, refreshToken, user }`
- `POST /api/auth/login` with unknown email → 401
- `POST /api/auth/login` with wrong password → 401
- `POST /api/auth/login` with missing body → 400

### 7. `tests/int/auth/register.int.spec.ts` *(NEW)*

Integration test for `POST /api/auth/register` route handler:
- `POST /api/auth/register` with valid data → 201 + `{ accessToken, refreshToken, user }`
- `POST /api/auth/register` with missing fields → 400
- `POST /api/auth/register` with existing email → appropriate error
- `POST /api/auth/register` with weak password → 400

---

## Implementation Order

1. Write `src/app/api/auth/login/route.ts`
2. Write `src/app/api/auth/register/route.ts`
3. Update `src/api/auth/register.ts` to accept `firstName`/`lastName`
4. Rewrite `src/api/auth/login.test.ts` for `AuthService`-based login
5. Update `src/api/auth/register.test.ts` for `firstName`/`lastName`
6. Write `tests/int/auth/login.int.spec.ts`
7. Write `tests/int/auth/register.int.spec.ts`
8. Run `pnpm test` and `pnpm tsc --noEmit`

---

## Reused Abstractions

- `getPayloadInstance()` from `@/services/progress` — standard Payload access pattern
- `getJwtService()` from `@/auth/index` — singleton JWT service
- `AuthService.login()` from `src/auth/auth-service.ts` — existing Payload-based login
- `register()` from `src/api/auth/register.ts` — existing pure registration function
- `vi.mock('@/getPayload')` pattern — consistent mock setup across auth tests
