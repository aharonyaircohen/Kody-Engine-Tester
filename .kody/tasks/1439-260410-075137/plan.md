## Existing Patterns Found

- **Next.js route handlers**: `src/app/api/courses/search/route.ts` - GET handler with `NextRequest`, returns `Response` with JSON
- **Auth module singletons**: `src/auth/index.ts` exports `userStore`, `sessionStore`, `jwtService`
- **Payload singleton**: `src/services/progress.ts` shows `getPayloadInstance()` pattern
- **Error throwing with status**: `src/api/auth/register.ts` throws `{ message, status }` errors

## Steps

### Step 1: Create login route handler

**File:** `src/app/api/auth/login/route.ts`
**Change:** Create POST route handler that parses email/password from body, calls `login()` from `src/api/auth/login.ts`, and returns JWT tokens
**Why:** The logic function exists but the HTTP endpoint doesn't
**Verify:** `pnpm test:int -- src/api/auth/login.test.ts`

```typescript
import { NextRequest } from 'next/server'
import { login } from '@/api/auth/login'
import { userStore, sessionStore, jwtService } from '@/auth'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password } = body

    const ipAddress = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1'
    const userAgent = request.headers.get('user-agent') ?? 'Unknown'

    const result = await login(email, password, ipAddress, userAgent, userStore, sessionStore, jwtService)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const err = error as { message?: string; status?: number }
    return new Response(
      JSON.stringify({ error: err.message ?? 'Login failed' }),
      { status: err.status ?? 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
```

### Step 2: Create register route handler

**File:** `src/app/api/auth/register/route.ts`
**Change:** Create POST route handler that parses email/password/confirmPassword from body, calls `register()` from `src/api/auth/register.ts`, and returns JWT tokens
**Why:** The logic function exists but the HTTP endpoint doesn't
**Verify:** `pnpm test:int -- src/api/auth/register.test.ts`

```typescript
import { NextRequest } from 'next/server'
import { register } from '@/api/auth/register'
import { getPayloadInstance } from '@/services/progress'
import { JwtService } from '@/auth/jwt-service'
import { AuthService } from '@/auth/auth-service'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password, confirmPassword } = body

    const ipAddress = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1'
    const userAgent = request.headers.get('user-agent') ?? 'Unknown'

    const payload = await getPayloadInstance()
    const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
    const authService = new AuthService(payload, jwtService)

    const result = await register(email, password, confirmPassword, ipAddress, userAgent, payload, authService)

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const err = error as { message?: string; status?: number }
    return new Response(
      JSON.stringify({ error: err.message ?? 'Registration failed' }),
      { status: err.status ?? 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
```

### Step 3: Verify all auth tests pass

**File:** (test verification)
**Change:** Run `pnpm test:int -- src/api/auth/` to verify all auth tests pass
**Why:** Ensure implementation is correct
**Verify:** Tests pass
