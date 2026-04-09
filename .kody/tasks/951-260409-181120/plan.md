## Existing Patterns Found

- `src/app/api/enroll/route.ts` — POST handler with `NextRequest`, auth via `withAuth`, Payload via `getPayloadInstance`, returns `Response` with JSON
- `src/app/api/health/route.ts` — Simple route handler pattern with `NextRequest` and `Response`
- `src/api/auth/login.ts` — Existing login logic using `UserStore`, `SessionStore`, `JwtService` with proper error handling (400/401/403/423)
- `src/api/auth/register.ts` — Existing register logic using `AuthService` with validation and error handling (400/409)
- `src/app/api/health/route.test.ts` — Test pattern using `NextRequest` directly and `vitest`

## Plan

**Step 1: Create directory and login route handler**

**File:** `src/app/api/auth/login/route.ts`
**Change:** Create POST route handler that parses `{ email, password }` from request body, calls existing login logic, and returns JWT tokens

```typescript
import { NextRequest } from 'next/server'
import { login } from '@/api/auth/login'
import { UserStore } from '@/auth/user-store'
import { SessionStore } from '@/auth/session-store'
import { JwtService } from '@/auth/jwt-service'

const userStore = new UserStore()
const sessionStore = new SessionStore()
const jwtService = new JwtService()

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password } = body

    const result = await login(
      email,
      password,
      request.headers.get('x-forwarded-for') || '127.0.0.1',
      request.headers.get('user-agent') || 'Unknown',
      userStore,
      sessionStore,
      jwtService
    )

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    const status = error.status || 500
    const message = error.message || 'Internal server error'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
```
**Why:** Route handlers in `src/app/api/` use Next.js App Router pattern with `NextRequest` and return `Response` objects. Login logic already exists in `src/api/auth/login.ts`.
**Verify:** `pnpm test:int -- --run src/app/api/auth/login/route.test.ts` (after creating test)

---

**Step 2: Create register route handler**

**File:** `src/app/api/auth/register/route.ts`
**Change:** Create POST route handler that parses `{ email, password, confirmPassword }` from request body, calls existing register logic, and returns JWT tokens

```typescript
import { NextRequest } from 'next/server'
import { register } from '@/api/auth/register'
import { getPayloadInstance } from '@/services/progress'
import { JwtService } from '@/auth/jwt-service'
import { AuthService } from '@/auth/auth-service'

const jwtService = new JwtService()

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password, confirmPassword } = body

    const payload = await getPayloadInstance()
    const authService = new AuthService(payload, jwtService)

    const result = await register(
      email,
      password,
      confirmPassword || '',
      request.headers.get('x-forwarded-for') || '127.0.0.1',
      request.headers.get('user-agent') || 'Unknown',
      payload,
      authService
    )

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    const status = error.status || 500
    const message = error.message || 'Internal server error'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
```
**Why:** Register logic exists in `src/api/auth/register.ts`. Uses same pattern as login route. `AuthService` is constructed with `payload` and `jwtService`.
**Verify:** `pnpm test:int -- --run src/app/api/auth/register/route.test.ts` (after creating test)

---

**Step 3: Create integration test for login route**

**File:** `src/app/api/auth/login/route.test.ts`
**Change:** Create integration test following pattern from `src/app/api/health/route.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

describe('POST /api/auth/login', () => {
  let request: NextRequest

  beforeEach(() => {
    request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 400 for missing email and password', async () => {
    request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 401 for non-existent user', async () => {
    request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@example.com', password: 'TestPass1!' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('returns 401 for wrong password', async () => {
    request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'wrongpassword' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('returns 200 with tokens for valid credentials', async () => {
    request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'AdminPass1!' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('accessToken')
    expect(body).toHaveProperty('refreshToken')
    expect(body.user.email).toBe('admin@example.com')
  })
})
```
**Why:** Integration tests for API routes use `NextRequest` directly. Tests success case and error cases per acceptance criteria.
**Verify:** `pnpm test:int -- --run src/app/api/auth/login/route.test.ts`

---

**Step 4: Create integration test for register route**

**File:** `src/app/api/auth/register/route.test.ts`
**Change:** Create integration test following same pattern

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

describe('POST /api/auth/register', () => {
  let request: NextRequest

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 400 for missing fields', async () => {
    request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 for invalid email format', async () => {
    request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: 'TestPass1!', confirmPassword: 'TestPass1!' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 for password mismatch', async () => {
    request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'TestPass1!', confirmPassword: 'Different1!' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 for weak password', async () => {
    request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'weak', confirmPassword: 'weak' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 409 for duplicate email', async () => {
    request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'TestPass1!', confirmPassword: 'TestPass1!' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(409)
  })

  it('returns 201 with tokens for valid registration', async () => {
    const uniqueEmail = `test${Date.now()}@example.com`
    request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: uniqueEmail, password: 'TestPass1!', confirmPassword: 'TestPass1!' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body).toHaveProperty('accessToken')
    expect(body).toHaveProperty('refreshToken')
    expect(body.user.email).toBe(uniqueEmail)
  })
})
```
**Why:** Tests all error cases (400, 409) and success case per acceptance criteria.
**Verify:** `pnpm test:int -- --run src/app/api/auth/register/route.test.ts`

---

**Step 5: Run full test suite**

**Verify:** `pnpm test:int -- --run src/app/api/auth/`

This runs all integration tests for the new auth routes.
