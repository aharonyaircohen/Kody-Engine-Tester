# Add auth middleware to protect routes

## Context
Protects existing routes by requiring a valid JWT in the Authorization header. All existing API routes that need authentication will use this middleware.

## Acceptance Criteria
- Middleware extracts JWT from `Authorization: Bearer <token>` header
- Returns 401 if token is missing or invalid
- Attaches decoded user info (id, email) to request context for downstream handlers
- Works with existing route handlers without modification to handler logic

## Test Strategy
- Unit tests for token extraction and verification logic
- Integration tests: request protected route without token (401), with invalid token (401), with valid token (passes to handler)
- Verify user context is correctly attached to request

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1675-260410-131347` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24244702068))

To rerun: `@kody rerun 1675-260410-131347 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🤔 **Kody has questions before proceeding:**

1. Which API routes should be protected by default? All /api/* routes or a specific subset?
2. Should protected routes allow optional auth (pass through without auth) or require auth for all requests?
3. How should the user context be attached to the request for downstream handlers - via headers, a custom property on the request, or a context object stored somewhere?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1675-260410-131948` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24244878417))

To rerun: `@kody rerun 1675-260410-131948 --from <stage>`

