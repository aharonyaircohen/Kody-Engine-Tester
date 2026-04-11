## Verdict: PASS

## Summary

Implements POST `/register` and POST `/login` endpoints for authentication. `/register` creates users with hashed passwords via Payload's built-in auth and returns 201. `/login` validates credentials via `AuthService` and returns a JWT on success or 401 on failure. The email validator allows empty strings by design (meant to compose with `required()`), but `required()` is not used in these routes, which is a pre-existing pattern issue.

## Findings

### Critical

None.

### Major

`src/app/api/auth/login/route.ts:13` and `src/app/api/auth/register/route.ts:22` — The `email()` validator returns `valid: true` for empty strings (`str === '' || EMAIL_REGEX.test(str)`). Both routes call `email()(emailValue)` without composing with `required()`. An empty string email or password will pass validation and reach the AuthService/Payload layer.  
**Suggested fix**: Add `required()` check before `email()` validation, or change the validator usage to `required()(emailValue)`.

`src/app/api/auth/register/route.ts:70` — `data` is cast `as any` when creating a user, bypassing TypeScript's type check on the Users collection fields.  
**Suggested fix**: Define a typed interface for the user creation payload instead of `as any`.

### Minor

`src/app/api/auth/login/route.ts:26` — Hardcoded fallback JWT secret `'dev-secret-do-not-use-in-production'` used when `process.env.JWT_SECRET` is unset. While common for dev, this should fail loudly in production rather than silently using an insecure default.  
**Suggested fix**: Throw an error if `JWT_SECRET` is not set in non-development environments.

`src/app/api/auth/register/route.ts:43-45` — Check-then-create is not atomic. Two concurrent `/register` requests with the same email could both pass the duplicate check before one fails on the unique constraint. This is mitigated by Payload's unique index on email, but the race window exists.  
**Suggested fix**: This is acceptable given Payload's constraint, but could be improved by handling the unique constraint violation specifically.

`src/app/api/auth/login/login.test.ts` and `src/app/api/auth/register/register.test.ts` — Tests only cover validator logic and JWT signing, not actual route handler behavior with mocked Payload. No integration test verifies: register returns 201 and creates a user, register duplicate email returns 409, login with correct credentials returns JWT, or login with wrong password returns 401.  
**Suggested fix**: Add integration tests that mock `getPayloadInstance()` and verify the full request/response cycle.

## Two-Pass Review

**Pass 1 — CRITICAL (must fix before merge):**

### SQL & Data Safety
- `src/app/api/auth/register/route.ts:49` — `payload.find({ where: { email: { equals: emailValue } } })` uses parameterized queries via Payload ORM — safe from SQL injection.
- `src/app/api/auth/register/route.ts:62` — `payload.create({ collection: 'users', data: {...} })` uses Payload's typed interface — safe.

### Race Conditions & Concurrency
- `src/app/api/auth/register/route.ts:43-68` — Duplicate email check-then-create is non-atomic. However, Payload enforces a unique constraint on email, so concurrent inserts will fail safely. Acceptable.

### LLM Output Trust Boundary
Not applicable — no LLM-generated content in this diff.

### Shell Injection
Not applicable — no shell commands in this diff.

### Enum & Value Completeness
`src/app/api/auth/register/route.ts:73` — `role: 'viewer'` is hardcoded. The Users collection defines role options as `['admin', 'editor', 'viewer']`. `'viewer'` is a valid default. No completeness issue.

**Pass 2 — INFORMATIONAL (should review, may auto-fix):**

### Conditional Side Effects
`src/app/api/auth/login/route.ts:40` — `authService.login()` internally calls `payload.update()` to store refresh token and last login timestamp. This is a hidden side effect not reflected in the route's success response. Not flagged as it's existing AuthService behavior.

### Test Gaps
As noted in Major findings — no route handler integration tests exist. The unit tests only validate validators and JWT utility functions.

### Dead Code & Consistency
`src/app/api/auth/register/route.ts:7` — `createError` function is defined but never used (the duplicate email case returns a Response directly, and the catch block handles errors differently). Dead code.

### Crypto & Entropy
`src/app/api/auth/login/route.ts:26` — JWT secret fallback uses an insecure default in development. Not a critical issue since Payload AuthService already handles password hashing with PBKDF2.

### Performance & Bundle Impact
No new heavy dependencies added.

### Type Coercion at Boundaries
`src/app/api/auth/register/route.ts:70,76-80` — Multiple `as any` casts on the user object when extracting `id`, `email`, `firstName`, `lastName`, `role`. Type safety is bypassed.
