# Add /login and /register endpoints

## Context
Provides HTTP endpoints for user registration and login. Both return JWT tokens for subsequent authenticated requests. Depends on User model existing first.

## Acceptance Criteria
- `POST /register` — accepts email/password, creates user, returns JWT access token
- `POST /login` — accepts email/password, validates credentials, returns JWT access token
- JWT contains userId and email claims, expires in 24h
- Passwords validated (min 8 chars) before hashing
- Duplicate email registration returns 409 Conflict
- Invalid credentials return 401 Unauthorized

## Test Strategy
- Integration tests for /register endpoint (success, duplicate email, weak password)
- Integration tests for /login endpoint (success, wrong password, nonexistent user)
- Unit tests for JWT generation and validation utilities

---

## Discussion (16 comments)

**@aharonyaircohen** (2026-04-11):
@kody

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `1927-260411-160632` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286264969))

To rerun: `@kody rerun 1927-260411-160632 --from <stage>`

**@aharonyaircohen** (2026-04-11):
🤔 **Kody has questions before proceeding:**

1. The acceptance criteria specifies JWT expires in 24h, but jwt-service.ts line 95 sets access token expiry to 15 minutes. Should access token expiry be changed to 24h (86400000ms)?
2. The Users collection requires firstName and lastName fields, but the register business logic in src/api/auth/register.ts only accepts email/password. Should register also accept and require firstName/lastName?
3. The task acceptance criteria says JWT should contain 'userId and email claims', but the existing TokenPayload includes role, sessionId, and generation. Should the implementation follow the task criteria (userId + email only) or the existing pattern (all fields)?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `approve`` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286339811))

To rerun: `@kody rerun approve` --from <stage>`

**@aharonyaircohen** (2026-04-11):
🤔 **Kody has questions before proceeding:**

1. The task acceptance criteria specifies JWT expires in 24h, but jwt-service.ts line 95 sets access token expiry to 15 minutes. Should access token expiry be changed to 24h (86400000ms)?
2. The Users collection requires firstName and lastName fields, but the register business logic only accepts email/password. Should register also accept and require firstName/lastName?
3. The task acceptance criteria says JWT should contain 'userId and email claims', but the existing TokenPayload includes role, sessionId, and generation. Should the implementation follow the task criteria (userId + email only) or the existing TokenPayload pattern (all fields)?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24286264969))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286306214))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24286264969)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🤔 **Kody has questions before proceeding:**

1. JWT expiry: task criteria specifies 24h but jwt-service.ts line 95 uses 15 minutes. Should access token expiry be changed to 24h (86400000ms)?
2. Users collection requires firstName and lastName fields, but register business logic only accepts email/password. Should register also accept and require firstName/lastName?
3. Task criteria says JWT should contain 'userId and email claims' only, but existing TokenPayload includes role, sessionId, and generation. Should implementation follow task criteria (userId + email only) or existing TokenPayload pattern?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `approve`` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286339817))

To rerun: `@kody rerun approve` --from <stage>`

**@aharonyaircohen** (2026-04-11):
🤔 **Kody has questions before proceeding:**

1. The acceptance criteria specifies JWT access token expires in 24h, but jwt-service.ts line 95 sets expiry to 15 minutes. Should access token expiry be changed to 24h?
2. The Users collection requires firstName and lastName fields, but the register business logic in src/api/auth/register.ts only accepts email/password. Should register also accept and require firstName/lastName?
3. The task acceptance criteria says JWT should contain 'userId and email claims' only, but the existing TokenPayload includes role, sessionId, and generation. Should the implementation follow the task criteria (userId + email only) or the existing TokenPayload pattern?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24286339811))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286380750))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24286339811)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🤔 **Kody has questions before proceeding:**

1. The task criteria specifies 24h JWT expiry but jwt-service.ts line 95 uses 15 minutes. Should access token expiry be changed to 24h (86400000ms)?
2. The Users collection requires firstName and lastName fields, but the register business logic in src/api/auth/register.ts only accepts email/password. Should register also accept and require firstName/lastName?
3. The task criteria says JWT should contain 'userId and email claims' only, but the existing TokenPayload includes role, sessionId, and generation. Should the implementation follow the task criteria (userId + email only) or the existing TokenPayload pattern (all fields)?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `approve`` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286406517))

To rerun: `@kody rerun approve` --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24286306214))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286416000))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24286306214)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🤔 **Kody has questions before proceeding:**

1. The Users collection requires firstName and lastName fields (required: true), but the existing register() business logic only accepts email/password. Should the register endpoint also accept firstName/lastName, or should these fields be made optional in the Users collection?
2. The task acceptance criteria specifies JWT expiry of 24h, but jwt-service.ts line 95 uses 15 minutes for access tokens. Should access token expiry be changed to 24h (86400000ms) as specified, or keep the existing 15-minute expiry with refresh token rotation?
3. The task criteria says JWT should contain 'userId and email claims' only, but the existing TokenPayload includes role, sessionId, and generation which are used throughout the auth system. Should the implementation follow the task criteria strictly or maintain the existing TokenPayload structure for consistency?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-11):
🤔 **Kody has questions before proceeding:**

1. JWT expiry: task criteria specifies 24h but jwt-service.ts line 95 uses 15 minutes. Should access token expiry be changed to 24h (86400000ms)?
2. Users collection requires firstName and lastName fields, but register business logic only accepts email/password. Should register also accept and require firstName/lastName?
3. Task criteria says JWT should contain 'userId and email claims' only, but existing TokenPayload includes role, sessionId, and generation. Should the implementation follow task criteria (userId + email only) or existing TokenPayload pattern (all fields)?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `approve`` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286445581))

To rerun: `@kody rerun approve` --from <stage>`

