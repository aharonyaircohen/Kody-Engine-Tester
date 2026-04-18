

## Plan: Create POST /api/auth/login and /api/auth/register Route Handlers

## Pattern Discovery Report

**Files searched:** `src/api/**/*.ts`, `src/app/api/**/*.ts`, `src/auth/**/*.ts` — none exist in the task directory. Pattern discovery is based on the project memory documentation provided in the task context.

**Existing patterns applied from project memory:**
- **Next.js App Router** route handlers in `src/app/(frontend)/api/` — route handler pattern
- **Auth HOC** `src/auth/withAuth.ts` — JWT/bearer extraction pattern
- **Middleware chain** `src/middleware/rate-limiter.ts` — `next()` promise chain for rate limiting
- **Result Type** `src/utils/result.ts` — `Result<T, E>` discriminated union for error returns
- **Zod schemas** in `src/validation/` — input validation at API boundaries
- **Service layer** `src/services/*.ts` — business logic behind route handlers
- **Test colocation** `src/**/*.test.ts` — `vi.fn()` + mocked Payload SDK

---

## Step 1: Write integration tests for login and register routes

**File:** `src/app/(frontend)/api/auth/login.test.ts`
**Change:** Create co-located test file for the login route handler:
- `POST /api/auth/login` with valid credentials → 200 + `{ accessToken, refreshToken, user }`
- `POST /api/auth/login` with wrong password → 401
- `POST /api/auth/login` with non-existent email → 401
- `POST /api/auth/login` with missing fields → 400 (validation error)

**File:** `src/app/(frontend)/api/auth/register.test.ts`
**Change:** Create co-located test file for the register route handler:
- `POST /api/auth/register` with valid input → 200 + `{ accessToken, refreshToken, user }`
- `POST /api/auth/register` with existing email → 409
- `POST /api/auth/register` with password mismatch → 400
- `POST /api/auth/register` with weak password → 400

**Why:** TDD ordering — tests written before implementation. Uses `vi.fn()` mocks for Payload SDK.

**Verify:** `pnpm test:int` — all new auth route tests pass

---

## Step 2: Create Zod validation schemas for auth inputs

**File:** `src/validation/auth-schemas.ts`
**Change:** Create Zod schemas:
```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
```

**Why:** Input validation at API boundary. Schema-driven error messages enable 400 responses with details. Weak password validation at 8-char minimum.

**Verify:** `pnpm lint` — no TypeScript/ESLint errors

---

## Step 3: Create POST /api/auth/login route handler

**File:** `src/app/(frontend)/api/auth/login/route.ts`
**Change:** Create the route handler file:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/validation/auth-schemas'
import { authService } from '@/auth/auth-service'
import { createRateLimiter } from '@/middleware/rate-limiter'

const rateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 })

export async function POST(req: NextRequest) {
  // Rate limiting (IP-based, 10 attempts / 15 min)
  const rateLimitResult = await rateLimiter(req, {} as NextRequest, () => Promise.resolve())
  if (rateLimitResult) {
    return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Parse & validate body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { email, password } = parsed.data

  // Authenticate via AuthService (PBKDF2, not UserStore)
  const result = await authService.login(email, password)

  if (!result.ok) {
    const status = result.error === 'INVALID_CREDENTIALS' ? 401 : 500
    return NextResponse.json({ error: result.error }, { status })
  }

  return NextResponse.json({
    accessToken: result.value.accessToken,
    refreshToken: result.value.refreshToken,
    user: result.value.user,
  }, { status: 200 })
}
```

**Why:** Route handler follows Next.js App Router pattern. Rate limiting prevents brute force. AuthService (PBKDF2) used per task requirement — not UserStore. `Result<T, E>` pattern maps error codes to HTTP statuses.

**Verify:** `pnpm build` — route compiles without errors

---

## Step 4: Create POST /api/auth/register route handler

**File:** `src/app/(frontend)/api/auth/register/route.ts`
**Change:** Create the route handler file:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/validation/auth-schemas'
import { authService } from '@/auth/auth-service'
import { createRateLimiter } from '@/middleware/rate-limiter'

const rateLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 })

export async function POST(req: NextRequest) {
  // Rate limiting — stricter for registration (5 attempts / 15 min)
  const rateLimitResult = await rateLimiter(req, {} as NextRequest, () => Promise.resolve())
  if (rateLimitResult) {
    return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Parse & validate body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { email, password, confirmPassword } = parsed.data

  if (password !== confirmPassword) {
    return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 })
  }

  // Register via AuthService (PBKDF2, not UserStore)
  const result = await authService.register(email, password)

  if (!result.ok) {
    if (result.error === 'EMAIL_EXISTS') {
      return NextResponse.json({ error: result.error }, { status: 409 })
    }
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({
    accessToken: result.value.accessToken,
    refreshToken: result.value.refreshToken,
    user: result.value.user,
  }, { status: 200 })
}
```

**Why:** Same pattern as login. Stricter rate limit for registration (5 vs 10 attempts per 15 min). AuthService used per task requirement. Email conflict maps to 409.

**Verify:** `pnpm build` — route compiles without errors

---

## Step 5: Verify tests pass

**Change:** Run the full integration test suite.

**Verify:** `pnpm test:int` — all auth route tests pass

---

## Summary

| Step | File | Purpose |
|------|------|---------|
| 1 | `src/app/(frontend)/api/auth/login.test.ts` | TDD: login route integration tests |
| 1 | `src/app/(frontend)/api/auth/register.test.ts` | TDD: register route integration tests |
| 2 | `src/validation/auth-schemas.ts` | Zod schemas for login + register input validation |
| 3 | `src/app/(frontend)/api/auth/login/route.ts` | POST /api/auth/login handler |
| 4 | `src/app/(frontend)/api/auth/register/route.ts` | POST /api/auth/register handler |
| 5 | `pnpm test:int` | Verify all tests pass |

## Questions

None — all architectural decisions are covered by the task description and existing project patterns. The task explicitly requires `AuthService` (PBKDF2) over `UserStore`, rate limiting via the existing middleware, and `Result<T, E>` error handling — all confirmed patterns in the project memory.