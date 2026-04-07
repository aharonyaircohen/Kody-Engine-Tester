## Plan

### Step 1: Create `src/app/api/auth/login/route.ts`

**File:** `src/app/api/auth/login/route.ts`

**Change:** Create the file with a POST handler that parses JSON body, extracts `email`/`password`/`ipAddress`/`userAgent`, calls `login()` from `@/api/auth/login` using auth singletons from `@/auth`, and returns JWT + user or error response.

```typescript
import { NextRequest } from 'next/server'
import { login } from '@/api/auth/login'
import { userStore, sessionStore, jwtService } from '@/auth'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password } = body

    const ipAddress = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const userAgent = request.headers.get('user-agent') ?? 'unknown'

    const result = await login(email, password, ipAddress, userAgent, userStore, sessionStore, jwtService)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    const status = err.status ?? 500
    return new Response(JSON.stringify({ error: err.message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
```

**Why:** Follows the same JSON body parsing + error handling pattern as `enroll/route.ts`. Auth routes don't need `withAuth` since they're the auth entry points.

**Verify:** `pnpm test:int -- --run src/api/auth/login.test.ts`

---

### Step 2: Create `src/app/api/auth/register/route.ts`

**File:** `src/app/api/auth/register/route.ts`

**Change:** Create the file with a POST handler that parses JSON body, extracts `email`/`password`/`confirmPassword`, calls `register()` from `@/api/auth/register` using `getPayloadInstance()` and `AuthService`, and returns JWT + user or error response.

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

    const ipAddress = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const userAgent = request.headers.get('user-agent') ?? 'unknown'

    const payload = await getPayloadInstance()
    const jwtService = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
    const authService = new AuthService(payload, jwtService)

    const result = await register(email, password, confirmPassword, ipAddress, userAgent, payload, authService)

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    const status = err.status ?? 500
    return new Response(JSON.stringify({ error: err.message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
```

**Why:** Uses `getPayloadInstance()` pattern from other API routes. `AuthService` handles user creation + JWT generation via Payload; `JwtService` is instantiated with env secret.

**Verify:** `pnpm test:int -- --run src/api/auth/register.test.ts`

---

### Step 3: Verify routes compile and tests pass

Run the full integration test suite to confirm no regressions.

**Verify:** `pnpm test:int -- --run`

---

## Existing Patterns Found

- **Route handler pattern** (`src/app/api/enroll/route.ts`): Next.js App Router POST handler, JSON body parsing, `getPayloadInstance()` call, structured error handling via `err.status`. Reused for both login and register routes.
- **Auth singletons** (`src/auth/index.ts`): `userStore`, `sessionStore`, `jwtService` exported as module-level singletons — used by `login()`.
- **AuthService + Payload pattern** (`src/api/auth/register.ts`, `src/auth/auth-service.ts`): `AuthService` takes `Payload` + `JwtService` instances and handles user creation and JWT issuance — used by `register()`.
- **Error shape** (`err.status` / `err.message`): Consistent with other routes that catch errors and return structured JSON responses.
