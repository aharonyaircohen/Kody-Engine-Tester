# Add /login and /register endpoints

## Context
Users need the ability to create an account (/register) and obtain a JWT token to authenticate subsequent requests (/login). These endpoints depend on the User model from Task 1.

## Acceptance Criteria
- POST /register accepts email and password, creates user, returns JWT
- POST /login accepts email and password, validates credentials, returns JWT
- Passwords are validated for minimum strength (e.g., 8+ chars)
- Duplicate email registration returns 409 Conflict
- Invalid credentials return 401 Unauthorized
- JWT expires in configured TTL (e.g., 24h)

## Test Strategy
- Unit test: register with valid credentials returns 201 and token
- Unit test: register with duplicate email returns 409
- Unit test: register with weak password returns 400
- Unit test: login with valid credentials returns 200 and token
- Unit test: login with wrong password returns 401
- Integration test: registered user can login with same credentials

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1174-260410-000135` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24219369715))

To rerun: `@kody rerun 1174-260410-000135 --from <stage>`

