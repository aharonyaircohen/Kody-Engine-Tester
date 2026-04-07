# Add /login and /register endpoints

## Context
Provides the authentication API surface. /register creates a new user; /login validates credentials and returns a JWT.

## Acceptance Criteria
- POST /register accepts { email, password }, creates user, returns JWT
- POST /login accepts { email, password }, returns JWT on success, 401 on failure
- Passwords are hashed before storage (never stored plaintext)
- Email uniqueness enforced (400 if duplicate)
- Unit tests for both endpoints

## Test Strategy
- Unit test: register new user, verify JWT returned
- Unit test: register duplicate email returns 400
- Unit test: login with correct credentials returns JWT
- Unit test: login with wrong password returns 401

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `812-260407-212643` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24105213361))

To rerun: `@kody rerun 812-260407-212643 --from <stage>`

**@aharonyaircohen** (2026-04-07):
🤔 **Kody has questions before proceeding:**

1. Should /register accept { email, password, confirmPassword } or just { email, password }? The existing register.ts requires confirmPassword but the task AC says only { email, password }.
2. Should /login use AuthService (Payload-based PBKDF2 hashing) or UserStore (SHA-256 in-memory)? The existing login.ts uses UserStore but register.ts uses AuthService — inconsistent.
3. The task says email uniqueness should return 400, but existing register.ts returns 409. Which status code is correct?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `812-260407-213229` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24105406934))

To rerun: `@kody rerun 812-260407-213229 --from <stage>`

