# Add auth middleware to protect routes

## Context
Middleware that validates JWT tokens on incoming requests. Protects existing routes by ensuring only authenticated users with a valid token can access them. Depends on the /login and /register endpoints having been implemented first.

## Acceptance Criteria
- Middleware extracts Bearer token from Authorization header
- Middleware verifies JWT signature using the secret key
- Middleware returns 401 Unauthorized if token is missing, expired, or invalid
- Middleware attaches decoded user info (userId, email) to request context
- Middleware is applied to specified protected routes
- Protected routes are NOT enumerated in this task — only the middleware itself

## Test Strategy
- Unit test: valid JWT passes through middleware
- Unit test: missing Authorization header returns 401
- Unit test: malformed JWT returns 401
- Unit test: expired JWT returns 401
- Unit test: request with valid token has user context attached

---

## Discussion (13 comments)

**@aharonyaircohen** (2026-04-11):
@kody

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `1925-260411-160629` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286263090))

To rerun: `@kody rerun 1925-260411-160629 --from <stage>`

**@aharonyaircohen** (2026-04-11):
⚡ **Complexity: low** — skipping plan, review, review-fix (not needed for low-risk tasks)

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24286263090))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286334146))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24286263090)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
⚠️ **Infrastructure issue detected:** Integration test in tests/int/api.int.spec.ts fails because drizzle-kit cannot bind query parameters ($1, $2) - test database connection issue

Set up proper PostgreSQL test database connection. The integration test expects a live database with schema introspection but the DATABASE_URL is either missing, invalid, or the connection is not passing parameters correctly to drizzle-kit.

**@aharonyaircohen** (2026-04-11):
🎉 PR created: https://github.com/aharonyaircohen/Kody-Engine-Tester/pull/1957

**@aharonyaircohen** (2026-04-11):
⚡ **Complexity: low** — skipping plan, review, review-fix (not needed for low-risk tasks)

**@aharonyaircohen** (2026-04-11):
## Pipeline Summary: `1925-260411-160629`

| Stage | Status | Duration | Retries |
|-------|--------|----------|---------|
| taskify | completed | - | 0 |
| plan | completed | - | 0 |
| build | completed | - | 0 |
| verify | completed | - | 0 |
| review | completed | - | 0 |
| review-fix | completed | - | 0 |
| ship | completed | - | 0 |

**Total:** 0s | **Complexity:** low | **Model:** MiniMax-M2.7-highspeed

**@aharonyaircohen** (2026-04-11):
## Pipeline Summary: `-Engine-Tester/actions/runs/24286263090))`

| Stage | Status | Duration | Retries |
|-------|--------|----------|---------|
| taskify | completed | - | 0 |
| plan | completed | - | 0 |
| build | completed | - | 0 |
| verify | completed | - | 1 |
| review | completed | - | 0 |
| review-fix | completed | - | 0 |
| ship | failed | - | 0 |

**Total:** 0s | **Complexity:** low | **Model:** MiniMax-M2.7-highspeed

**@aharonyaircohen** (2026-04-11):
❌ Pipeline failed at **ship**: Command failed: git push --force-with-lease -u origin HEAD
To https://github.com/aharonyaircohen/Kody-Engine-Tester
 ! [rejected]        HEAD -> 1925--add-auth-middleware-to-protect-routes (stale info

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286556465))

To rerun: `@kody rerun -Engine-Tester --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24286556465))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286674607))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24286556465)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24286334146))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286444992))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24286334146)) --from <stage>`

