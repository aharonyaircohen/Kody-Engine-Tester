# Add auth middleware to protect routes

## Context
This task adds middleware that protects existing routes by verifying JWT tokens. It depends on the login/register endpoints from the previous task. Protected routes will reject requests without valid Bearer tokens.

## Acceptance Criteria
- Auth middleware extracts and verifies JWT from Authorization: Bearer header
- Sets req.user with decoded userId and email on valid token
- Returns 401 for missing token, 403 for invalid/expired token
- Apply middleware to protect existing routes
- Unit tests for middleware: valid token passes, missing token returns 401, invalid token returns 403, expired token returns 403

## Test Strategy
- Unit test middleware in isolation with mock request/response objects
- Integration test with a protected test route

---

## Discussion (5 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1440-260410-075137` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24232611801))

To rerun: `@kody rerun 1440-260410-075137 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🤔 **Kody has questions before proceeding:**

1. The acceptance criteria says '403 for invalid/expired token' but the existing implementation/middleware returns 401. Should expired/invalid tokens return 401 or 403?
2. Should the /api/health route remain unprotected (for load balancer health checks) or should it also require auth?
3. Should /api/csrf-token remain unprotected since CSRF tokens are meant to be fetched by unauthenticated users?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
Orphan issue from aborted test suite run . Taskify test was interrupted. Closing to clean up.

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1440-260410-075747` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24232776923))

To rerun: `@kody rerun 1440-260410-075747 --from <stage>`

