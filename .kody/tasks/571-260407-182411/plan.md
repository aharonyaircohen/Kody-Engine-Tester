
## Existing Patterns Found

- `src/app/api/health/route.ts` - Basic GET route handler using `NextRequest`/`Response` with JSON headers
- `src/app/api/enroll/route.ts` - POST handler using `getPayloadInstance` from `@/services/progress`, returns `Response` with proper status codes
- `src/api/auth/register.ts` - Business logic for registration: email validation, password strength check (8+ chars, uppercase, number, special char), checks for duplicate email via Payload, creates user with `role: 'viewer'`
- `src/api/auth/login.ts` - Business logic for login using `UserStore` (SHA-256) and `SessionStore`/`JwtService`
- `src/auth/auth-service.ts` - `AuthService.login()` using Payload's hash/salt fields with PBKDF2 password verification
- `src/collections/Users.ts` - Users collection with `firstName` and `lastName` as required fields
- `src/app/api/health/route.test.ts` - Vitest test pattern for API routes with `NextRequest`

## Plan

**Step 1: Create login route handler**

**File:** `src/app/api/auth/login/route.ts`
**Change:** Create POST route handler at `/api/auth/login` that:
- Parses JSON body `{ email, password }`
- Calls `login()` from `@/api/auth/login` with required dependencies
- Returns 200 with JWT tokens on success
- Returns 401 on invalid credentials
- Returns 400 for missing fields

**Verify:** `pnpm test:int src/app/api/auth/login/route.test.ts`

---

**Step 2: Create register route handler**

**File:** `src/app/api/auth/register/route.ts`
**Change:** Create POST route handler at `/api/auth/register` that:
- Parses JSON body `{ email, password, confirmPassword }`
- Calls `register()` from `@/api/auth/register`
- Returns 201 with user data + tokens on success
- Returns 409 on duplicate email
- Returns 400 on validation failure

**Verify:** `pnpm test:int src/app/api/auth/register/route.test.ts`

---

**Step 3: Create login route tests**

**File:** `src/app/api/auth/login/route.test.ts`
**Change:** Create vitest integration tests:
- Missing email/password returns 400
- Invalid credentials returns 401
- Valid credentials returns 200 with JWT tokens
- Test JWT token structure

**Verify:** `pnpm test:int src/app/api/auth/login/route.test.ts`

---

**Step 4: Create register route tests**

**File:** `src/app/api/auth/register/route.test.ts`
**Change:** Create vitest integration tests:
- Missing fields returns 400
- Invalid email format returns 400
- Weak password returns 400
- Mismatched passwords returns 400
- Duplicate email returns 409
- Success returns 201 with user data (no passwordHash)

**Verify:** `pnpm test:int src/app/api/auth/register/route.test.ts`

---

**Step 5: Run all tests**

**Verify:** `pnpm test:int`
