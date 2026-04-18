# Implement /login and /register API endpoints

## Context
JWT authentication requires a login endpoint to validate credentials and issue tokens, and a register endpoint to create new users. These are the primary auth entry points for clients.

## Acceptance Criteria
- POST /api/auth/register accepts { email, password } and creates a user with hashed password
- POST /api/auth/login accepts { email, password } and returns a JWT on success
- Login returns 401 for invalid credentials (no information leakage)
- Register returns 409 for duplicate email
- Both endpoints use Zod validation for input

## Test Strategy
- Unit test: validate Zod schemas
- Integration test: register user, login with correct credentials, login with wrong password

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2789-260418-164730`

**@aharonyaircohen** (2026-04-18):
🤔 **Kody has questions before proceeding:**

1. The acceptance criteria specify 'Zod validation' but zod is not listed in package.json. Should we add zod as a dependency, or should we use the custom mini-Zod already in src/utils/schema.ts?
2. The existing register function at src/api/auth/register.ts takes a confirmPassword parameter, but the AC says 'POST /api/auth/register accepts { email, password }' — should confirmPassword be removed from the public API, or should it remain optional/internal?
3. Should the new routes be public (no auth required), or should they be protected with any rate-limiting middleware (e.g., the existing rate-limiter)?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `approve``

