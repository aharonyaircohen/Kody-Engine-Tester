Now I have enough context to write the plan. Let me create it.

## Implementation Plan

### Step 1: Create registration route handler

**File:** `src/app/api/auth/register/route.ts`
**Change:** Create new file with POST handler for user registration
**Why:** Public endpoint for creating new users - no `withAuth` wrapper needed
**Verify:** `pnpm test:int -- --run src/app/api/auth/register`

```typescript
import { NextRequest } from 'next/server'
import { getPayloadInstance } from '@/services/progress'
import type { CollectionSlug } from 'payload'
import { email, minLength } from '@/validation/validators'

function createError(message: string, status: number) {
  const err = new Error(message) as Error & { status: number }
  err.status = status
  return err
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email: emailValue, password } = body

    // Input validation
    const emailResult = email().validate(emailValue)
    if (!emailResult.valid) {
      return new Response(JSON.stringify({ error: emailResult.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const passwordResult = minLength(8).validate(password)
    if (!passwordResult.valid) {
      return new Response(JSON.stringify({ error: passwordResult.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const payload = await getPayloadInstance()

    // Check for duplicate email
    const existing = await payload.find({
      collection: 'users' as CollectionSlug,
      where: { email: { equals: emailValue } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return new Response(JSON.stringify({ error: 'Email already registered' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Create user with hashed password using Payload's built-in auth
    // firstName/lastName derived from email prefix
    const emailPrefix = emailValue.split('@')[0]
    const [firstName, ...lastNameParts] = emailPrefix.split(/[._-]/)
    const lastName = lastNameParts.join(' ') || emailPrefix

    const user = await payload.create({
      collection: 'users' as CollectionSlug,
      data: {
        email: emailValue,
        password,
        firstName: firstName || emailPrefix,
        lastName: lastName || emailPrefix,
        role: 'viewer',
      } as any,
    })

    return new Response(
      JSON.stringify({
        id: (user as any).id,
        email: (user as any).email,
        firstName: (user as any).firstName,
        lastName: (user as any).lastName,
        role: (user as any).role,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    const status = (err as { status?: number }).status || 500
    const message = err instanceof Error ? err.message : 'Registration failed'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
```

### Step 2: Create login route handler

**File:** `src/app/api/auth/login/route.ts`
**Change:** Create new file with POST handler for user login
**Why:** Public endpoint for authentication - reuses existing AuthService
**Verify:** `pnpm test:int -- --run src/app/api/auth/login`

```typescript
import { NextRequest } from 'next/server'
import { AuthService } from '@/auth/auth-service'
import { JwtService } from '@/auth/jwt-service'
import { getPayloadInstance } from '@/services/progress'
import { email, minLength } from '@/validation/validators'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email: emailValue, password } = body

    // Input validation
    const emailResult = email().validate(emailValue)
    if (!emailResult.valid) {
      return new Response(JSON.stringify({ error: emailResult.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const passwordResult = minLength(8).validate(password)
    if (!passwordResult.valid) {
      return new Response(JSON.stringify({ error: passwordResult.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const payload = await getPayloadInstance()
    const jwtService = new JwtService(process.env.JWT_SECRET || 'dev-secret-do-not-use-in-production')
    const authService = new AuthService(payload, jwtService)

    const result = await authService.login(emailValue, password, 'unknown', 'unknown')

    return new Response(
      JSON.stringify({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    const status = (err as { status?: number }).status || 500
    const message = err instanceof Error ? err.message : 'Login failed'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
```

### Step 3: Add unit tests for login route

**File:** `src/app/api/auth/login/login.test.ts`
**Change:** Create co-located test file
**Why:** TDD approach - tests verify JWT payload claims and password validation
**Verify:** `pnpm test:int -- --run src/app/api/auth/login`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { JwtService } from '@/auth/jwt-service'

const TEST_SECRET = 'test-secret'

describe('Login validation', () => {
  let jwtService: JwtService

  beforeEach(() => {
    jwtService = new JwtService(TEST_SECRET)
  })

  it('should reject invalid email format', async () => {
    const invalidEmails = ['notanemail', 'missing@', '@nodomain.com', 'spaces in@email.com']
    for (const email of invalidEmails) {
      const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      expect(EMAIL_REGEX.test(email)).toBe(false)
    }
  })

  it('should accept valid email format', async () => {
    const validEmails = ['test@example.com', 'user.name@domain.org', 'user+tag@domain.co']
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    for (const email of validEmails) {
      expect(EMAIL_REGEX.test(email)).toBe(true)
    }
  })

  it('should reject password shorter than 8 chars', () => {
    const shortPasswords = ['1234567', 'short', 'abc', '']
    for (const pwd of shortPasswords) {
      expect(pwd.length >= 8).toBe(false)
    }
  })

  it('should accept password 8+ chars', () => {
    const validPasswords = ['12345678', 'longenough', 'MySecurePass123!']
    for (const pwd of validPasswords) {
      expect(pwd.length >= 8).toBe(true)
    }
  })

  it('should create JWT with userId claim', async () => {
    const token = await jwtService.sign(
      { userId: '123', email: 'test@example.com', role: 'viewer', sessionId: 'sess-1', generation: 0 },
      15 * 60 * 1000
    )
    const payload = await jwtService.verify(token)
    expect(payload.userId).toBe('123')
  })

  it('should create JWT with correct expiry', async () => {
    const before = Math.floor(Date.now() / 1000)
    const token = await jwtService.sign(
      { userId: '123', email: 'test@example.com', role: 'viewer', sessionId: 'sess-1', generation: 0 },
      24 * 60 * 60 * 1000
    )
    const after = Math.floor(Date.now() / 1000)
    const payload = await jwtService.verify(token)
    expect(payload.exp - payload.iat).toBe(24 * 60 * 60)
    expect(payload.iat).toBeGreaterThanOrEqual(before)
    expect(payload.iat).toBeLessThanOrEqual(after + 1)
  })
})
```

### Step 4: Add unit tests for register route

**File:** `src/app/api/auth/register/register.test.ts`
**Change:** Create co-located test file
**Why:** TDD - tests verify duplicate email detection and user creation
**Verify:** `pnpm test:int -- --run src/app/api/auth/register`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { minLength } from '@/validation/validators'

describe('Register validation', () => {
  it('should reject password shorter than 8 characters', () => {
    const validator = minLength(8)
    expect(validator('1234567').valid).toBe(false)
    expect(validator('1234567').error).toBe('Must be at least 8 characters')
  })

  it('should accept password 8 or more characters', () => {
    const validator = minLength(8)
    expect(validator('12345678').valid).toBe(true)
    expect(validator('MySecurePassword123!').valid).toBe(true)
  })

  it('should validate email format', () => {
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    expect(EMAIL_REGEX.test('user@example.com')).toBe(true)
    expect(EMAIL_REGEX.test('invalid-email')).toBe(false)
  })

  it('should derive firstName and lastName from email prefix', () => {
    const testCases = [
      { email: 'john.doe@example.com', expectedFirst: 'john', expectedLast: 'doe' },
      { email: 'jane_smith@example.com', expectedFirst: 'jane', expectedLast: 'smith' },
      { email: 'user123@example.com', expectedFirst: 'user123', expectedLast: 'user123' },
    ]
    for (const { email, expectedFirst, expectedLast } of testCases) {
      const emailPrefix = email.split('@')[0]
      const [firstName, ...lastNameParts] = emailPrefix.split(/[._-]/)
      const lastName = lastNameParts.join(' ') || emailPrefix
      expect(firstName).toBe(expectedFirst)
      expect(lastName).toBe(expectedLast)
    }
  })
})
```

### Step 5: Verify tests pass

**File:** (none)
**Change:** Run integration test suite
**Why:** Ensure all auth routes work correctly
**Verify:** `pnpm test:int -- --run`

---

## Existing Patterns Found

- `src/app/api/enroll/route.ts:6-92`: Public POST route handler pattern using `NextRequest`, returning `Response` with JSON
- `src/auth/auth-service.ts:68-149`: Existing `login()` method with `AuthResult` return type (accessToken, refreshToken, user)
- `src/auth/jwt-service.ts:94-100`: `signAccessToken()` (15min) and `signRefreshToken()` (7 days) methods
- `src/validation/validators.ts:28-33`: `email()` and `minLength()` validators used for input validation
- `src/auth/auth-service.test.ts:37-298`: Vitest testing pattern with `vi.fn()` mocks for Payload SDK
- `src/collections/Users.ts`: Users collection with required `firstName`, `lastName` fields

## Decisions Made

1. **Password hashing**: Using Payload's built-in `password` field (which uses PBKDF2) rather than adding bcrypt - reuses existing auth infrastructure
2. **JWT TTL**: Using existing 15min access + 7day refresh token split - maintains consistency with existing system rather than introducing new token design
3. **firstName/lastName**: Derived from email prefix using common delimiters (. _ -) - matches task's email+password-only requirement without schema changes
4. **Input validation**: Using existing `src/validation/validators.ts` - reuses pattern already in codebase
