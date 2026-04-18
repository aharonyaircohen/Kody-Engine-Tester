# Plan: Add login and register route handlers

## Context

The codebase already has `AuthService` (`src/auth/auth-service.ts`) with `login()` and the `register()` function (`src/api/auth/register.ts`). There are unit tests for both. However, no Next.js route handlers exist yet to expose them as HTTP endpoints. This task adds those two route handlers.

---

## What to create

### File 1: `src/app/api/auth/login/route.ts`

POST-only handler (no `withAuth` — this is the login endpoint).

```
POST /api/auth/login
Body: { email: string, password: string }
Success: 200 { accessToken, refreshToken, user: { id, email, role } }
Errors:
  400 — missing email or password
  401 — invalid credentials
  403 — account inactive
```

Dependencies:
- `getPayloadInstance()` from `@/services/progress` for Payload
- `JwtService` from `@/auth/jwt-service`
- `AuthService.login()` from `src/auth/auth-service.ts`
- `extract ipAddress` from `x-forwarded-for` or `request.ip`
- `extract userAgent` from `request.headers.get('user-agent')`

Reuse module-level singleton pattern (same as `withAuth.ts`):
```typescript
let jwtServiceInstance: JwtService | null = null
let authServiceInstance: AuthService | null = null

function getJwtService(): JwtService {
  if (!jwtServiceInstance) {
    jwtServiceInstance = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
  }
  return jwtServiceInstance
}

function getAuthService(payload: Payload): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService(payload, getJwtService())
  }
  return authServiceInstance
}
```

### File 2: `src/app/api/auth/register/route.ts`

POST-only handler (no `withAuth` — registration is unauthenticated).

```
POST /api/auth/register
Body: { email: string, password: string, confirmPassword: string }
Success: 201 { accessToken, refreshToken, user: { id, email, role } }
Errors:
  400 — missing fields, invalid email, password mismatch, weak password
  409 — email already in use
```

Dependencies:
- `getPayloadInstance()` from `@/services/progress`
- `JwtService` from `@/auth/jwt-service`
- `register()` from `src/api/auth/register.ts` (validates + calls `authService.login()`)
- Same singleton pattern as above (reuses `getJwtService` / `getAuthService`)

---

## Error handling pattern

Both handlers wrap service calls in `try/catch`. Errors from services have `.status` property (set by `createError` in each service file). Map to HTTP responses:

```typescript
try {
  const result = await authService.login(email, password, ipAddress, userAgent)
  return Response.json(result, { status: 200 })
} catch (err) {
  const status = (err as any).status ?? 500
  const message = err instanceof Error ? err.message : 'Internal server error'
  return Response.json({ error: message }, { status })
}
```

---

## Existing files to reference

| File | Purpose |
|------|---------|
| `src/auth/auth-service.ts` | `AuthService.login()` |
| `src/api/auth/register.ts` | `register()` function |
| `src/app/api/enroll/route.ts` | Next.js route handler pattern with Payload |
| `src/services/progress.ts` | `getPayloadInstance()` |
| `src/auth/jwt-service.ts` | `JwtService` constructor |

---

## Testing

- Add unit tests in `src/app/api/auth/login/route.test.ts` and `src/app/api/auth/register/route.test.ts`
- Mock `getPayloadInstance` + `JwtService`
- Test each error case: 400, 401, 403, 409
- Follow the existing `src/app/api/health/route.test.ts` pattern for route handler tests

---

## Verification

```bash
# TypeScript check
pnpm tsc --noEmit

# Run unit tests
pnpm test:int

# Manual verification (requires DB running)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}'
```
