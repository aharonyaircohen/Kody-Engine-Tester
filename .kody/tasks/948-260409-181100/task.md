# Add /login and /register endpoints

## Context
Authentication endpoints are needed for users to register and obtain JWT tokens. These endpoints depend on the User model from task 1.

## Acceptance Criteria
- POST /register: accepts email/password, creates user with hashed password, returns user data (not password)
- POST /login: accepts email/password, validates credentials, returns JWT token on success
- Passwords are hashed using bcrypt or equivalent before storage
- JWT tokens signed with secret key, contain userId and email, expire after configured duration
- Error responses: 400 for validation errors, 401 for invalid credentials, 409 for duplicate email on register

## Test Strategy
- Unit tests for password hashing in register flow
- Integration tests for /register endpoint (success, duplicate email, invalid input)
- Integration tests for /login endpoint (success, wrong password, non-existent user)
- Test JWT token structure and expiration

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `948-260409-181100` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24205872738))

To rerun: `@kody rerun 948-260409-181100 --from <stage>`

