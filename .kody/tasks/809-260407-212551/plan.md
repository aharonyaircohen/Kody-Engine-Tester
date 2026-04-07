Now I have all the context needed. Let me write the plan.

---

## Implementation Plan

## Existing Patterns Found

- **`src/app/api/health/route.ts`**: Next.js App Router POST endpoint pattern — parses JSON body, returns `Response` with status code and JSON headers
- **`src/app/api/enroll/route.ts`**: `getPayloadInstance()` for Payload SDK access; error handling via `try/catch` with status-coded `Response` objects
- **`src/api/auth/register.ts`**: Business logic with email validation, password strength, duplicate check, and calls `AuthService.login()`
- **`src/api/auth/login.ts`**: Business logic with `UserStore`/`SessionStore`/`JwtService` (old auth pattern)
- **`src/auth/index.ts`**: Module-level singletons `jwtService`, `userStore`, `sessionStore` — reused by route handlers

---

## Step 1: Create POST /register route handler

**File:** `src/app/api/auth/register/route.ts`
**Change:** New file — POST handler that parses `{ email, password, confirmPassword }`, calls `register()` business logic, returns 201 on success or error with appropriate status code.
**Why:** The business logic already exists in `src/api/auth/register.ts`; this step wires it to an HTTP endpoint.
**Verify:** `pnpm test:int -- --run src/api/auth/register.test.ts`

```typescript
import { NextRequest } from 'next/server'
import { getPayloadInstance } from '@/services/progress'
import { jwtService } from '@/auth'
import { AuthService } from '@/auth/auth-service'
import { register } from '@/api/auth/register'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password, confirmPassword } = body

    const payload = await getPayloadInstance()
    const authService = new AuthService(payload, jwtService)

    const ipAddress = request.headers.get('x-forwarded-for') ?? 'unknown'
    const userAgent = request.headers.get('user-agent') ?? 'unknown'

    const result = await register(
      email,
      password,
      confirmPassword,
      ipAddress,
      userAgent,
      payload,
      authService
    )

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : 'Internal server error'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
```

---

## Step 2: Create POST /login route handler

**File:** `src/app/api/auth/login/route.ts`
**Change:** New file — POST handler that parses `{ email, password }`, calls `login()` business logic, returns 200 on success or 401 on failure.
**Why:** The business logic already exists in `src/api/auth/login.ts` using the `UserStore`/`SessionStore`/`JwtService` pattern.
**Verify:** `pnpm test:int -- --run src/api/auth/login.test.ts`

```typescript
import { NextRequest } from 'next/server'
import { userStore, sessionStore, jwtService } from '@/auth'
import { login } from '@/api/auth/login'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password } = body

    const ipAddress = request.headers.get('x-forwarded-for') ?? 'unknown'
    const userAgent = request.headers.get('user-agent') ?? 'unknown'

    const result = await login(
      email,
      password,
      ipAddress,
      userAgent,
      userStore,
      sessionStore,
      jwtService
    )

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : 'Internal server error'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
```

---

## Step 3: Verify

**Change:** Run integration tests to confirm the new routes work end-to-end.
**Verify:** `pnpm test:int -- --run src/api/auth/register.test.ts src/api/auth/login.test.ts && pnpm build`
