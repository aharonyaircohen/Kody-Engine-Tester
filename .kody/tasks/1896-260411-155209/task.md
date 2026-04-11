# Add /login and /register endpoints

## Context
These endpoints provide the authentication API surface. `/register` creates a new user account, and `/login` validates credentials and issues a JWT for session management. Both depend on the User model from the first task.

## Acceptance Criteria
- `POST /register` accepts `{ email, password }`, creates User with hashed password, returns `{ user, token }`
- `POST /login` accepts `{ email, password }`, verifies credentials, returns `{ user, token }`
- JWT token payload includes `userId` and `email`
- Passwords are never returned in responses
- Invalid credentials return 401 with generic error message
- Duplicate email on register returns 409 Conflict

## Test Strategy
- Integration tests for `/register`: happy path, duplicate email, missing fields, weak password
- Integration tests for `/login`: happy path, wrong password, non-existent user
- Verify JWT is present in successful responses
- Verify response bodies do not include `passwordHash`

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-11):
@kody

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `1896-260411-155209` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286023373))

To rerun: `@kody rerun 1896-260411-155209 --from <stage>`

