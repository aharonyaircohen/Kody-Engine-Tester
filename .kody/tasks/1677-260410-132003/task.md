# Add /login and /register endpoints

## Context
These endpoints provide the authentication API surface. POST /register creates a new user account. POST /login validates credentials and returns a JWT for subsequent authenticated requests.

## Acceptance Criteria
- POST /register accepts {email, password}, creates user with hashed password, returns 201 with user data (no passwordHash)
- POST /login accepts {email, password}, returns 200 with JWT on valid credentials
- POST /login returns 401 on invalid email or password
- POST /register returns 409 if email already exists
- Password in request body is never stored or logged

## Test Strategy
- Integration tests for /register: success case, duplicate email, invalid email format, weak password
- Integration tests for /login: success returns JWT, wrong password returns 401, non-existent user returns 401
- Verify JWT is valid and contains expected claims

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1677-260410-131445` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24244726618))

To rerun: `@kody rerun 1677-260410-131445 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🤔 **Kody has questions before proceeding:**

1. The register service function requires confirmPassword but task spec only mentions {email, password}. Should the API accept confirmPassword as required field, or should it be optional (service handles validation)?
2. The task spec says register returns 201 with user data (no passwordHash), but current register service calls authService.login and returns tokens. Should register return just user info, or user info + JWT tokens like the current implementation?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1677-260410-132003` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24244889852))

To rerun: `@kody rerun 1677-260410-132003 --from <stage>`

