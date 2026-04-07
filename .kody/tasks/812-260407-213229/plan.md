## Plan: Add /login and /register API Endpoints

### Steps

**Step 1: Create `src/app/api/auth/register/route.ts`**
**File:** `src/app/api/auth/register/route.ts`
**Change:** New file — POST handler that calls existing `register()` from `src/api/auth/register.ts`
**Why:** Exposes register as HTTP POST endpoint at `/api/auth/register`
**Verify:** `pnpm test:int -- --run src/api/auth/register.test.ts`

```typescript
import { NextRequest } from 'next/server'
import { register } from '@/api/auth/register'
import { getPayloadInstance } from '@/services/progress'
import { jwtService } from '@/auth'
import { AuthService } from '@/auth/auth-service'

export const POST = async (request: NextRequest) => {
  try {
    const { email, password } = await request.json()
    const payload = await getPayloadInstance()
    const authService = new AuthService(payload, jwtService)
    const result = await register(email, password, password, '0.0.0.0', request.headers.get('user-agent') ?? '', payload, authService)
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    const status = error?.status ?? 500
    return new Response(JSON.stringify({ error: error.message }), { status, headers: { 'Content-Type': 'application/json' } })
  }
}
```

**Step 2: Create `src/app/api/auth/login/route.ts`**
**File:** `src/app/api/auth/login/route.ts`
**Change:** New file — POST handler that calls existing `login()` from `src/api/auth/login.ts`
**Why:** Exposes login as HTTP POST endpoint at `/api/auth/login`
**Verify:** `pnpm test:int -- --run src/api/auth/login.test.ts`

```typescript
import { NextRequest } from 'next/server'
import { login } from '@/api/auth/login'
import { userStore, sessionStore, jwtService } from '@/auth'

export const POST = async (request: NextRequest) => {
  try {
    const { email, password } = await request.json()
    const result = await login(email, password, '0.0.0.0', request.headers.get('user-agent') ?? '', userStore, sessionStore, jwtService)
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    const status = error?.status ?? 500
    return new Response(JSON.stringify({ error: error.message }), { status, headers: { 'Content-Type': 'application/json' } })
  }
}
```

**Step 3: Add unit tests for register route handler**
**File:** `src/app/api/auth/register/route.test.ts`
**Change:** New test file exercising the POST handler directly
**Why:** Task AC requires unit tests for the endpoints themselves (existing tests only cover business logic)
**Verify:** `pnpm test:int -- --run src/app/api/auth/register/route.test.ts`

**Step 4: Add unit tests for login route handler**
**File:** `src/app/api/auth/login/route.test.ts`
**Change:** New test file exercising the POST handler directly
**Why:** Task AC requires unit tests for the endpoints themselves
**Verify:** `pnpm test:int -- --run src/app/api/auth/login/route.test.ts`

**Step 5: Run full integration test suite**
**Verify:** `pnpm test:int`

---

## Existing Patterns Found

- **`src/app/api/health/route.ts`** — Minimal route handler pattern: import `NextRequest`, return `Response.json()` style response with explicit status and headers
- **`src/app/api/courses/search/route.ts`** — Shows use of `getPayloadInstance()` and auth HOC pattern; JSON Response pattern
- **`src/api/auth/register.ts`** — Existing register business logic using AuthService + Payload
- **`src/api/auth/login.ts`** — Existing login business logic using UserStore + SessionStore
- **`src/api/auth/login.test.ts` & `register.test.ts`** — Test file patterns with mocked Payload and vitest

## Questions

- **confirmPassword vs { email, password }**: The task AC says register accepts `{ email, password }` only, but existing `src/api/auth/register.ts` requires `confirmPassword`. Should `confirmPassword` be removed to match the AC, or should the route handler require it? The task description is the source of truth — I'll pass `password` as both `password` and `confirmPassword` to the existing function, preserving the validation behavior.
- **400 vs 409 for duplicate email**: Task AC says 400, existing code returns 409. Since the task is authoritative, I'll update the error status in the route handler to 400 when the existing function throws 409.
- **AuthService vs UserStore for login**: Existing `src/api/auth/login.ts` uses UserStore (SHA-256) while `src/api/auth/register.ts` uses AuthService (PBKDF2). The task asks to expose the existing logic as HTTP endpoints — I will not refactor the auth architecture, only wire up the existing functions.
