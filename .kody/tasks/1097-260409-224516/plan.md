## Implementation Plan

### Pattern Discovery Report

- **Route handler pattern**: `src/app/api/enroll/route.ts` and `src/app/api/health/route.ts` show how to create Next.js route handlers that return JSON Response objects
- **Auth dependencies**: `src/auth/index.ts` exports module-level singletons (`userStore`, `sessionStore`, `jwtService`) and AuthService for Payload-based auth
- **Business logic**: `src/api/auth/login.ts` and `src/api/auth/register.ts` contain the login/register logic already
- **Testing pattern**: `src/app/api/health/route.test.ts` shows route handler tests using `NextRequest` to call handlers directly
- **IP/User-Agent extraction**: `src/app/api/csrf-token/route.ts` shows `request.headers.get()` pattern

---

### Step 1: Create login route handler

**File:** `src/app/api/auth/login/route.ts`

```typescript
import { NextRequest } from 'next/server'
import { login } from '@/api/auth/login'
import { userStore, sessionStore, jwtService } from '@/auth'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password } = body

    const ipAddress = request.headers.get('x-forwarded-for')
      ?? request.headers.get('x-real-ip')
      ?? '0.0.0.0'
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
  } catch (error: unknown) {
    const status = (error as { status?: number }).status ?? 500
    const message = error instanceof Error ? error.message : 'Internal server error'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
```

**Verify:** `pnpm test:int src/app/api/auth/login/route.test.ts`

---

### Step 2: Create register route handler

**File:** `src/app/api/auth/register/route.ts`

```typescript
import { NextRequest } from 'next/server'
import { register } from '@/api/auth/register'
import { AuthService } from '@/auth/auth-service'
import { JwtService } from '@/auth/jwt-service'
import { getPayloadInstance } from '@/services/progress'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password, confirmPassword } = body

    const ipAddress = request.headers.get('x-forwarded-for')
      ?? request.headers.get('x-real-ip')
      ?? '0.0.0.0'
    const userAgent = request.headers.get('user-agent') ?? 'unknown'

    const payload = await getPayloadInstance()
    const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
    const authService = new AuthService(payload, jwtService)

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
  } catch (error: unknown) {
    const status = (error as { status?: number }).status ?? 500
    const message = error instanceof Error ? error.message : 'Internal server error'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
```

**Verify:** `pnpm test:int src/app/api/auth/register/route.test.ts`

---

### Step 3: Create login route tests

**File:** `src/app/api/auth/login/route.test.ts`

Tests for success (200), missing email (400), missing password (400), invalid credentials (401), empty body (400).

**Verify:** `pnpm test:int src/app/api/auth/login/route.test.ts`

---

### Step 4: Create register route tests

**File:** `src/app/api/auth/register/route.test.ts`

Tests for success (201), duplicate email (409), weak password (400), mismatched passwords (400), invalid email (400), empty body (400).

**Verify:** `pnpm test:int src/app/api/auth/register/route.test.ts`

---

### Step 5: Run all tests

**Verify:** `pnpm test:int`
