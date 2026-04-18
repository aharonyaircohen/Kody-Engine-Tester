

## Existing Patterns Found

- **`getAuthService()` singleton in `withAuth.ts`**: The module-level singleton factory (`getAuthService()`) uses `getPayloadInstance()` + `JwtService` internally — plan reuses it by exporting the factory, avoiding duplicate instantiation.
- **Route handler pattern** (`src/app/api/health/route.ts`): `new Response(JSON.stringify(...), { status, headers })` — no framework wrappers, pure Next.js `NextRequest` / `Response`.
- **Co-located test pattern** (`src/app/api/health/route.test.ts`): `*.test.ts` next to `route.ts`, `vi.useFakeTimers()`, `NextRequest` construction.
- **`AuthService.login()` error shape**: Throws `{ message, status }` errors — route handler catches `err.status` to set HTTP response code.
- **CORS headers**: Present on other routes; included here for frontend compatibility.

---

## Plan

### Step 1: Export `getAuthService` from `withAuth.ts`

**File:** `src/auth/withAuth.ts`
**Change:** Add `export` keyword to line 21 — promote `getAuthService` from private module factory to a reusable exported singleton getter.

```typescript
export function getAuthService(): AuthService {
```

**Why:** The route handler needs to call the same singleton that `withAuth` uses — exporting the factory avoids duplicate instantiation and keeps one shared `AuthService` instance across the app.
**Verify:** `pnpm lint` passes.

---

### Step 2: Write unit tests for the login route handler

**File:** `src/app/api/auth/login/route.test.ts`
**Change:** Create the test file with three test cases:

1. **`POST` valid credentials → 200**: Mock `AuthService.login` to resolve with `{ accessToken, refreshToken, user }`; verify response status 200 and JSON body matches.
2. **`POST` missing fields → 400**: Mock `AuthService.login` to throw `{ message: 'Email is required', status: 400 }`; verify response status 400 and `{ error: '...' }` body.
3. **`POST` invalid credentials → 401**: Mock `AuthService.login` to throw `{ message: 'Invalid credentials', status: 401 }`; verify response status 401 and `{ error: '...' }` body.

Uses `vi.mock('@/auth/withAuth', ...)` to stub `getAuthService`, `vi.useFakeTimers()` to control token timestamps, and `NextRequest` with JSON body.

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'

// Mock getAuthService
vi.mock('@/auth/withAuth', () => ({
  getAuthService: vi.fn(),
}))

// Mock AuthService
vi.mock('@/auth/auth-service', () => ({
  AuthService: vi.fn(),
}))

const mockAuthService = {
  login: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-04-18T12:00:00.000Z'))
  const { getAuthService } = vi.mocked(await import('@/auth/withAuth'))
  ;(getAuthService as ReturnType<typeof vi.fn>).mockReturnValue(mockAuthService as any)
})

afterEach(() => { vi.useRealTimers() })

describe('POST /api/auth/login', () => {
  it('returns 200 and tokens on valid credentials', async () => {
    const authResult = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: 1, email: 'admin@example.com', role: 'admin' },
    }
    mockAuthService.login.mockResolvedValue(authResult)

    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'password123' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(authResult)
  })

  it('returns 400 when email is missing', async () => {
    const err = new Error('Email is required') as Error & { status: number }
    err.status = 400
    mockAuthService.login.mockRejectedValue(err)

    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'password123' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Email is required' })
  })

  it('returns 401 on invalid credentials', async () => {
    const err = new Error('Invalid credentials') as Error & { status: number }
    err.status = 401
    mockAuthService.login.mockRejectedValue(err)

    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'wrongpassword' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Invalid credentials' })
  })
})
```

**Verify:** `pnpm test:int -- --run src/app/api/auth/login/route.test.ts`

---

### Step 3: Create the route handler

**File:** `src/app/api/auth/login/route.ts`

```typescript
import { NextRequest } from 'next/server'
import { getAuthService } from '@/auth/withAuth'

export const POST = async (request: NextRequest) => {
  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  // Parse body
  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }

  const { email, password } = body

  // Validate required fields
  if (!email) {
    return new Response(JSON.stringify({ error: 'Email is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }

  if (!password) {
    return new Response(JSON.stringify({ error: 'Password is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }

  // Extract client metadata for audit
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    '0.0.0.0'
  const userAgent = request.headers.get('user-agent') ?? 'unknown'

  try {
    const authService = getAuthService()
    const result = await authService.login(email, password, ip, userAgent)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 401
    const message = err instanceof Error ? err.message : 'Authentication failed'

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
}
```

**Why:** Reuses the existing `getAuthService()` singleton (not a new instance), handles all error cases with proper status codes, extracts client IP for audit logging, and includes CORS headers for frontend access.
**Verify:** `pnpm test:int -- --run src/app/api/auth/login/route.test.ts`

---

### Step 4: Run full integration test suite

**Verify:** `pnpm test:int -- --run` — all tests pass, no regressions.