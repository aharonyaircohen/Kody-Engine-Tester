# Add /login and /register endpoints

## Context
Create authentication API endpoints for user registration and login. These endpoints allow users to create accounts and obtain JWT tokens for subsequent authenticated requests. Depends on the User model task.

## Acceptance Criteria
- POST /register: accepts email/password, creates user, returns JWT
- POST /login: accepts email/password, validates credentials, returns JWT
- Passwords are validated against the stored hash
- Returns appropriate HTTP status codes (201 for register, 200 for login, 401 for invalid credentials, 400 for validation errors)
- JWT payload includes userId and email
- Endpoints follow REST conventions and project naming (kebab-case route files)

## Test Strategy
- Integration tests for /register endpoint: success case, duplicate email, weak password
- Integration tests for /login endpoint: success case, wrong password, non-existent user
- Test edge cases: empty body, malformed JSON

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `1097-260409-224516` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24216988983))

To rerun: `@kody rerun 1097-260409-224516 --from <stage>`

