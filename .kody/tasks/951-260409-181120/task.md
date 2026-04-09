# Add /login and /register API endpoints

## Context
These endpoints provide the authentication surface for the application. POST /register creates a new user account and returns credentials. POST /login validates email/password and returns a JWT token for subsequent authenticated requests.

## Acceptance Criteria
- POST /register accepts `{ email, password }`, creates user with hashed password, returns JWT token
- POST /login accepts `{ email, password }`, validates credentials, returns JWT token
- Returns 400 for invalid input (missing fields, invalid email format)
- Returns 401 for login with non-existent user or wrong password
- Returns 409 for register with existing email
- JWT payload includes userId and email claims

## Test Strategy
- Integration tests for /register: success case, duplicate email, invalid input
- Integration tests for /login: success case, wrong password, non-existent user
- Unit tests for JWT token generation and validation

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `951-260409-181120` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24205874452))

To rerun: `@kody rerun 951-260409-181120 --from <stage>`

