## Existing Patterns Found

- `src/app/api/enroll/route.ts` — Next.js App Router POST handler pattern: parse JSON body, call service, return Response with status
- `src/api/auth/login.ts` — Login business logic using UserStore, SessionStore, JwtService (already implemented)
- `src/api/auth/register.ts` — Register business logic using Payload + AuthService (already implemented)
- `src/auth/index.ts` — Exports module-level singletons: `userStore`, `sessionStore`, `jwtService`
- `src/services/progress.ts` — Uses `getPayloadInstance()` pattern for Payload access

## Plan

### Step 1: Create login route handler

**File:** `src/app/api/auth/login/route.ts`
**Change:** New file with POST handler that parses `{email, password}`, calls login from `src/api/auth/login.ts`, returns `{user, token}` excluding passwordHash
**Why:** HTTP endpoint to expose the existing login business logic
**Verify:** `pnpm build` passes

```typescript
import { NextRequest } from 'next/server'
import { login } from '@/api/auth/login'
import { userStore, sessionStore, jwtService } from '@/auth'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password } = body

    const result = await login(email, password, '127.0.0.1', 'unknown', userStore, sessionStore, jwtService)

    // Return user without sensitive fields
    const { user, accessToken, refreshToken } = result
    return new Response(
      JSON.stringify({
        user: { id: user.id, email: user.email, role: user.role },
        token: accessToken,
        refreshToken,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    const status = (error as { status?: number }).status ?? 500
    const message = (error as Error).message ?? 'Internal server error'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
```

### Step 2: Create register route handler

**File:** `src/app/api/auth/register/route.ts`
**Change:** New file with POST handler that parses `{email, password}`, calls register from `src/api/auth/register.ts`, returns `{user, token}` excluding passwordHash
**Why:** HTTP endpoint to expose the existing register business logic
**Verify:** `pnpm build` passes

```typescript
import { NextRequest } from 'next/server'
import { register } from '@/api/auth/register'
import { getPayloadInstance } from '@/services/progress'
import { AuthService } from '@/auth/auth-service'
import { jwtService } from '@/auth'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password, confirmPassword } = body

    const payload = await getPayloadInstance()
    const authService = new AuthService(payload, jwtService)

    const result = await register(email, password, confirmPassword ?? password, '127.0.0.1', 'unknown', payload, authService)

    // Return user without sensitive fields
    const { user, accessToken, refreshToken } = result
    return new Response(
      JSON.stringify({
        user: { id: user.id, email: user.email, role: user.role },
        token: accessToken,
        refreshToken,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    const status = (error as { status?: number }).status ?? 500
    const message = (error as Error).message ?? 'Internal server error'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
```

### Step 3: Verify build

**Verify:** Run `pnpm build` to confirm no TypeScript or Next.js errors
