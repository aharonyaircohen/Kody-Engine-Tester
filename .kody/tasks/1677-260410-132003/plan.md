Now I have enough context. Let me create the plan:

## Plan: Add /login and /register API endpoints

### Existing Patterns Found

- **Route handler pattern**: `src/app/api/enroll/route.ts` - POST handler with JSON body parsing, but uses `withAuth` wrapper. For public endpoints (login/register), handlers should be direct without auth wrapping.
- **Health route pattern**: `src/app/api/health/route.ts` - Simple direct handler without auth for public endpoint.
- **Auth service**: `src/auth/auth-service.ts:68-149` - `login()` method validates credentials and returns `AuthResult` with `{accessToken, refreshToken, user}`.
- **Register service**: `src/api/auth/register.ts:21-70` - Existing register function requires `confirmPassword` and calls `authService.login()` afterward, returning tokens. Does NOT match spec which says register should return user data only (no tokens) and not require `confirmPassword`.
- **Error handling pattern**: Service functions throw errors with `{message, status}` properties; route handlers catch and return appropriate HTTP responses.

### Key Discrepancy to Resolve

The existing `src/api/auth/register.ts` does NOT match the task spec:
- It requires `confirmPassword` - spec says only `{email, password}`
- It calls `authService.login()` and returns tokens - spec says return only user data

**Approach**: Create a new `registerUser` function in `src/api/auth/register.ts` that accepts `{email, password}` and returns only user data (no tokens). The existing `register` function can remain for backward compatibility if used elsewhere.

---

## Steps

### Step 1: Create test file for login endpoint

**File:** `src/app/api/auth/login/route.test.ts`
**Change:** Create integration test for `POST /api/auth/login`:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

// Mock Payload
const mockPayload = {
  findByID: vi.fn(),
  find: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
}

vi.mock('@/getPayload', () => ({
  getPayloadInstance: vi.fn(() => mockPayload),
}))

vi.mock('crypto', () => ({
  default: {
    pbkdf2: vi.fn((password, salt, iterations, keylen, digest, callback) => {
      const testHash = Buffer.from('aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899', 'hex')
      callback(null, testHash)
    }),
    randomBytes: vi.fn(() => Buffer.from('testsalt123')),
    timingSafeEqual: vi.fn(() => true),
  },
}))

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with JWT tokens on valid credentials', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      hash: 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899',
      salt: 'testsalt123',
      role: 'viewer',
      isActive: true,
    }
    mockPayload.find.mockResolvedValue({ docs: [mockUser] })
    mockPayload.update.mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'Password123!' }),
    })

    // Import route handler after mocks are set up
    const { POST } = await import('./route')
    const response = await POST(request)
    
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.accessToken).toBeDefined()
    expect(body.refreshToken).toBeDefined()
    expect(body.user.email).toBe('test@example.com')
  })

  it('returns 401 on non-existent user', async () => {
    mockPayload.find.mockResolvedValue({ docs: [] })

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@example.com', password: 'Password123!' }),
    })

    const { POST } = await import('./route')
    const response = await POST(request)
    
    expect(response.status).toBe(401)
  })

  it('returns 401 on wrong password', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      hash: 'aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899',
      salt: 'testsalt123',
      role: 'viewer',
      isActive: true,
    }
    mockPayload.find.mockResolvedValue({ docs: [mockUser] })

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'WrongPassword123!' }),
    })

    const { POST } = await import('./route')
    const response = await POST(request)
    
    expect(response.status).toBe(401)
  })

  it('returns 400 for missing email or password', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    const { POST } = await import('./route')
    const response = await POST(request)
    
    expect(response.status).toBe(400)
  })
})
```
**Why:** TDD approach - write tests first to define expected behavior
**Verify:** `pnpm test:int src/app/api/auth/login/route.test.ts`

---

### Step 2: Create login route handler

**File:** `src/app/api/auth/login/route.ts`
**Change:** Create POST handler that calls `authService.login()`:
```typescript
import { NextRequest } from 'next/server'
import { getPayloadInstance } from '@/services/progress'
import { AuthService } from '@/auth/auth-service'
import { JwtService } from '@/auth/jwt-service'

let jwtServiceInstance: JwtService | null = null
let authServiceInstance: AuthService | null = null

function getJwtService(): JwtService {
  if (!jwtServiceInstance) {
    jwtServiceInstance = new JwtService(process.env.JWT_SECRET ?? 'dev-secret-do-not-use-in-production')
  }
  return jwtServiceInstance
}

function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService(getPayloadInstance() as any, getJwtService())
  }
  return authServiceInstance
}

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const authService = getAuthService()
    const result = await authService.login(email, password, '0.0.0.0', request.headers.get('user-agent') ?? '')

    return Response.json(result, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const error = err as Error & { status?: number }
    const status = error.status ?? 401
    return Response.json(
      { error: error.message ?? 'Authentication failed' },
      { status, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
```
**Why:** Public endpoint that accepts {email, password}, calls authService.login, returns tokens on success or 401 on failure
**Verify:** `pnpm test:int src/app/api/auth/login/route.test.ts`

---

### Step 3: Create test file for register endpoint

**File:** `src/app/api/auth/register/route.test.ts`
**Change:** Create integration test for `POST /api/auth/register`:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mockPayload = {
  findByID: vi.fn(),
  find: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
}

vi.mock('@/getPayload', () => ({
  getPayloadInstance: vi.fn(() => mockPayload),
}))

vi.mock('crypto', () => ({
  default: {
    pbkdf2: vi.fn((password, salt, iterations, keylen, digest, callback) => {
      const testHash = Buffer.from('aabbccddeeff0011223344556677889900aabbccddeeff00112233445566778899', 'hex')
      callback(null, testHash)
    }),
    randomBytes: vi.fn(() => Buffer.from('testsalt123')),
    timingSafeEqual: vi.fn(() => true),
  },
}))

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 201 with user data on successful registration', async () => {
    mockPayload.find.mockResolvedValue({ docs: [] }) // no existing user
    mockPayload.create.mockResolvedValue({ id: 1, email: 'new@example.com', role: 'viewer' })

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'new@example.com', password: 'NewPass123!' }),
    })

    const { POST } = await import('./route')
    const response = await POST(request)
    
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.email).toBe('new@example.com')
    expect(body.role).toBe('viewer')
    expect(body.passwordHash).toBeUndefined()
    expect(body.password).toBeUndefined()
  })

  it('returns 409 for duplicate email', async () => {
    mockPayload.find.mockResolvedValue({ docs: [{ id: 1, email: 'existing@example.com' }] })

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'existing@example.com', password: 'NewPass123!' }),
    })

    const { POST } = await import('./route')
    const response = await POST(request)
    
    expect(response.status).toBe(409)
  })

  it('returns 400 for invalid email format', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: 'NewPass123!' }),
    })

    const { POST } = await import('./route')
    const response = await POST(request)
    
    expect(response.status).toBe(400)
  })

  it('returns 400 for weak password', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'new@example.com', password: 'weak' }),
    })

    const { POST } = await import('./route')
    const response = await POST(request)
    
    expect(response.status).toBe(400)
  })

  it('returns 400 for missing email or password', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'new@example.com' }),
    })

    const { POST } = await import('./route')
    const response = await POST(request)
    
    expect(response.status).toBe(400)
  })
})
```
**Why:** TDD approach - define expected behavior including 201 for success, 409 for duplicate, 400 for validation errors
**Verify:** `pnpm test:int src/app/api/auth/register/route.test.ts`

---

### Step 4: Create register service function that matches spec

**File:** `src/api/auth/register-user.ts` (new file)
**Change:** Create `registerUser` function that accepts `{email, password}` only and returns user data without tokens:
```typescript
import type { Payload } from 'payload'
import type { CollectionSlug } from 'payload'

function createError(message: string, status: number): Error & { status: number } {
  const err = new Error(message) as Error & { status: number }
  err.status = status
  return err
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character'
  return null
}

export interface RegisterUserResult {
  id: number | string
  email: string
  role: string
}

export async function registerUser(
  email: string,
  password: string,
  payload: Payload
): Promise<RegisterUserResult> {
  if (!email || !password) {
    throw createError('Email and password are required', 400)
  }

  if (!EMAIL_REGEX.test(email)) {
    throw createError('Invalid email format', 400)
  }

  const strengthError = validatePasswordStrength(password)
  if (strengthError) {
    throw createError(strengthError, 400)
  }

  // Check if user already exists
  const existing = await payload.find({
    collection: 'users' as CollectionSlug,
    where: { email: { equals: email } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    throw createError('Email already in use', 409)
  }

  // Create user in Payload - Password is hashed by Payload's internal mechanism
  const user = await payload.create({
    collection: 'users' as CollectionSlug,
    data: {
      email,
      password,
      role: 'viewer',
    } as any,
  })

  return {
    id: (user as any).id,
    email: (user as any).email,
    role: (user as any).role,
  }
}
```
**Why:** The existing `register` function in `src/api/auth/register.ts` requires `confirmPassword` and returns tokens. This new function accepts only `{email, password}` and returns just user data per the spec.
**Verify:** `pnpm test:int src/api/auth/register-user.test.ts` (create basic test)

---

### Step 5: Create register route handler

**File:** `src/app/api/auth/register/route.ts`
**Change:** Create POST handler that calls `registerUser()`:
```typescript
import { NextRequest } from 'next/server'
import { getPayloadInstance } from '@/services/progress'
import { registerUser } from '@/api/auth/register-user'

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const payload = await getPayloadInstance()
    const user = await registerUser(email, password, payload as any)

    return Response.json(user, {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const error = err as Error & { status?: number }
    const status = error.status ?? 400
    return Response.json(
      { error: error.message ?? 'Registration failed' },
      { status, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
```
**Why:** Public endpoint that accepts {email, password}, creates user, returns 201 with user data (no passwordHash) or appropriate error
**Verify:** `pnpm test:int src/app/api/auth/register/route.test.ts`

---

### Step 6: Run all tests

**Verify:** `pnpm test:int` to ensure all integration tests pass
**Verify:** `pnpm lint` to ensure no linting errors

---

## Questions

1. **Password confirmation**: The existing register service requires `confirmPassword`, but the task spec only mentions `{email, password}`. The plan above creates a new `registerUser` function that only accepts `{email, password}` per the spec. Should `confirmPassword` be supported as an optional field for better UX (password confirmation dialog)?

2. **JWT claims verification**: The test strategy mentions verifying JWT contains expected claims. Should the tests verify specific claims (userId, email, role, sessionId) or just that the token is valid and parseable?
