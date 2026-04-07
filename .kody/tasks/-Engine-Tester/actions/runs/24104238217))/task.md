# Add /login and /register API endpoints

## Context
Implement the authentication endpoints that allow users to register and obtain JWT tokens. These endpoints depend on the User model existing.

## Acceptance Criteria
- POST /register: creates user, returns JWT (or error on duplicate email)
- POST /login: validates credentials, returns JWT on success, 401 on failure
- Passwords are never returned in responses
- Input validation (email format, password min length)
- JWT contains user ID and expires in reasonable timeframe

## Test Strategy
- Unit test: register creates user with valid input
- Unit test: register fails with duplicate email
- Unit test: login succeeds with valid credentials
- Unit test: login fails with wrong password
- Integration test: full register → login flow

---

## Discussion (3 comments)

**@aharonyaircohen** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `764-260407-210237` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24104238217))

To rerun: `@kody rerun 764-260407-210237 --from <stage>`

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24104238217))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24104332518))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24104238217)) --from <stage>`

