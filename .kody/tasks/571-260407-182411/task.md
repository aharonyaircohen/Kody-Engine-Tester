# Add /login and /register auth endpoints

## Context
Exposes HTTP endpoints for user registration and login. Register creates a new user account. Login validates credentials and returns a JWT token for session management. Both endpoints are standalone and do not require middleware.

## Acceptance Criteria
- POST /register accepts `{ email, password }` and creates a user
- POST /register returns 201 on success with user data (no passwordHash)
- POST /register returns 409 Conflict if email already exists
- POST /login accepts `{ email, password }` and validates credentials
- POST /login returns 200 with JWT token on valid credentials
- POST /login returns 401 Unauthorized on invalid credentials
- Passwords are validated for minimum strength (e.g., 8+ chars)
- All passwords are hashed before storage (never stored plain)

## Test Strategy
- Unit test: register hashes password, not plain text
- Unit test: login rejects invalid password
- Integration test: full /register → /login flow
- Integration test: /register rejects duplicate email
- Integration test: /login returns valid JWT

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `571-260407-181838` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24097290054))

To rerun: `@kody rerun 571-260407-181838 --from <stage>`

**@aharonyaircohen** (2026-04-07):
🤔 **Kody has questions before proceeding:**

1. What should the default role be for newly registered users? The Users collection defaults to 'viewer' but UserStore uses 'user'.
2. Should firstName and lastName be required fields for registration, or should registration accept just email/password?
3. The acceptance criteria mentions 8+ chars for password validation - is this the only validation rule, or should we require mixed case, numbers, etc.?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `571-260407-182411` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24097472861))

To rerun: `@kody rerun 571-260407-182411 --from <stage>`

