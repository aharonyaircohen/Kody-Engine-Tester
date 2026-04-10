# Add /login and /register endpoints

## Context
Implements the authentication API surface. Register creates new user accounts; Login validates credentials and issues JWTs. Both endpoints are prerequisites for the auth middleware.

## Acceptance Criteria
- POST /api/auth/register accepts { email, password } and creates user with hashed password
- POST /api/auth/login accepts { email, password } and returns JWT on success
- Login returns 401 for invalid credentials with generic error message
- Register returns 409 if email already exists
- JWT expires in 7 days, refresh token expires in 30 days
- Tokens signed with HS256 using JWT_SECRET environment variable

## Test Strategy
- Unit test: register successfully creates user with hashed password
- Unit test: register returns 409 for duplicate email
- Unit test: login succeeds with valid credentials and returns tokens
- Unit test: login returns 401 with invalid password
- Unit test: login returns 401 for non-existent user

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1726-260410-141513` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24247321901))

To rerun: `@kody rerun 1726-260410-141513 --from <stage>`

