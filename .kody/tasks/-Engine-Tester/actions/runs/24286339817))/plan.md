Now I have a clear picture. Let me write the plan.

---

## Existing Patterns Found

- **Route handler pattern**: `src/app/api/notes/route.ts` shows the canonical Next.js App Router pattern — `export const GET/POST` functions receiving `NextRequest`, returning `Response` with JSON, using `getPayloadInstance()` for Payload access
- **Business logic layer**: `src/api/auth/register.ts` and `src/api/auth/login.ts` contain the auth business logic that the route handlers should delegate to
- **AuthService pattern**: `src/auth/auth-service.ts` provides Payload-based login with JWT token generation via `JwtService`
- **Users collection**: `src/collections/Users.ts` requires `firstName` and `lastName` fields (required: true) but existing `register()` only accepts email/password

---

## Questions

1. **JWT expiry**: Task criteria specifies 24h, but `jwt-service.ts:95` uses 15 minutes. Should `signAccessToken()` be changed to 24h, or should this be a new method?
2. **Register field mismatch**: `Users` collection requires `firstName`/`lastName`, but existing `register()` only accepts `email`/`password`. Should `register()` be extended to accept firstName/lastName, or should firstName/lastName be made optional in Users?
3. **JWT payload contents**: Task criteria says "JWT contains userId and email claims", but existing TokenPayload includes role/sessionId/generation used throughout auth. Should route handler use minimal payload (userId+email) or full TokenPayload?

---

## Plan

**Step 1: Create test for POST /login route handler**

**File:** `src/app/api/auth/login/route.test.ts`
**Change:** Write integration tests for `POST /login/route.ts`:
- Returns 200 with tokens on valid credentials
- Returns 401 on invalid password
- Returns 401 on nonexistent user
- Returns 400 on missing email/password

**Verify:** `pnpm test:int src/app/api/auth/login/route.test.ts`

---

**Step 2: Create test for POST /register route handler**

**File:** `src/app/api/auth/register/route.test.ts`
**Change:** Write integration tests for `POST /register/route.ts`:
- Returns 201 with tokens on valid registration
- Returns 409 on duplicate email
- Returns 400 on weak password (too short, no uppercase, no number, no special char)
- Returns 400 on mismatched passwords
- Returns 400 on missing required fields

**Verify:** `pnpm test:int src/app/api/auth/register/route.test.ts`

---

**Step 3: Create POST /login route handler**

**File:** `src/app/api/auth/login/route.ts`
**Change:** Create route handler that:
1. Parses JSON body for `email` and `password`
2. Gets Payload instance and JwtService
3. Calls `AuthService.login(email, password, ipAddress, userAgent)`
4. Returns `{ accessToken, refreshToken, user }` on success
5. Returns appropriate error status (401 for invalid credentials, 400 for missing fields)

```typescript
import { NextRequest } from 'next/server'
import { getPayloadInstance } from '@/services/progress'
import { getJwtService } from '@/auth'
import { AuthService } from '@/auth/auth-service'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const payload = await getPayloadInstance()
    const jwtService = getJwtService()
    const authService = new AuthService(payload, jwtService)

    const ipAddress = request.headers.get('x-forwarded-for') ?? 'unknown'
    const userAgent = request.headers.get('user-agent') ?? 'unknown'

    const result = await authService.login(email, password, ipAddress, userAgent)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const error = err as { message?: string; status?: number }
    const status = error.status ?? 500
    return new Response(JSON.stringify({ error: error.message ?? 'Internal server error' }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
```

**Verify:** `pnpm test:int src/app/api/auth/login/route.test.ts`

---

**Step 4: Update register business logic to accept firstName/lastName**

**File:** `src/api/auth/register.ts`
**Change:** Extend `register()` function signature and implementation to accept and require `firstName` and `lastName`:
- Add `firstName: string, lastName: string` parameters
- Pass firstName/lastName to `payload.create()`
- Validate that firstName and lastName are non-empty

**Verify:** `pnpm test:int src/api/auth/register.test.ts`

---

**Step 5: Create POST /register route handler**

**File:** `src/app/api/auth/register/route.ts`
**Change:** Create route handler that:
1. Parses JSON body for `email`, `password`, `confirmPassword`, `firstName`, `lastName`
2. Validates required fields
3. Gets Payload instance and creates AuthService
4. Calls `register(email, password, confirmPassword, firstName, lastName, ipAddress, userAgent, payload, authService)`
5. Returns 201 with tokens on success
6. Returns 409 on duplicate email
7. Returns 400 on validation failures

**Verify:** `pnpm test:int src/app/api/auth/register/route.test.ts`

---

**Step 6: Run full integration test suite**

**Verify:** `pnpm test:int` passes
