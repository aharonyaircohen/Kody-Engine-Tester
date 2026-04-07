# Add /login and /register endpoints

## Context
Implement authentication endpoints so users can register an account and log in to receive a JWT token. These endpoints depend on the User model from Task 1.

## Acceptance Criteria
- POST /register: accepts email and password, creates user, returns JWT
- POST /login: accepts email and password, returns JWT on success, 401 on failure
- Passwords are validated (min length, etc.)
- Duplicate email registration returns 409 Conflict
- JWT contains user ID and expires in configurable duration

## Test Strategy
- Integration test: register new user returns 201 and JWT
- Integration test: register duplicate email returns 409
- Integration test: login with valid credentials returns 200 and JWT
- Integration test: login with invalid credentials returns 401
- Integration test: password validation errors return 400

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `809-260407-212551` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24105194689))

To rerun: `@kody rerun 809-260407-212551 --from <stage>`

