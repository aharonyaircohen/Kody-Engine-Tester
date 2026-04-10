# Add /login and /register JWT endpoints

## Context
This task implements the authentication endpoints that allow users to register and login. It depends on the User model from the previous task. The endpoints return JWT tokens upon successful authentication.

## Acceptance Criteria
- POST /register: accepts email and password, creates user, returns JWT
- POST /login: accepts email and password, verifies credentials, returns JWT
- JWT contains userId and email claims with configurable expiration
- Passwords are never returned in responses
- Appropriate error responses: 400 for validation, 409 for duplicate email on register, 401 for invalid credentials on login
- Unit tests for JWT generation utility

## Test Strategy
- Unit test JWT generation and verification
- Integration test each endpoint with supertest or equivalent: register success, register duplicate email, login success, login wrong password

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1439-260410-075137` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24232611933))

To rerun: `@kody rerun 1439-260410-075137 --from <stage>`

