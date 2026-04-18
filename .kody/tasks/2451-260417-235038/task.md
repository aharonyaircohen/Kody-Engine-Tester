# Add auth middleware to protect existing routes

## Context
The `withAuth` HOC exists at `src/auth/withAuth.ts` but is not applied to existing API routes. This task applies auth protection to routes that require authentication based on the domain model (e.g., /api/notes, /api/enroll, /api/gradebook).

## Acceptance Criteria
- Routes that modify data (POST /api/notes, POST /api/enroll) require valid JWT
- Routes that read sensitive data (/api/gradebook/*) require valid JWT
- Unauthenticated requests receive 401 response
- Auth errors do not leak implementation details

## Test Strategy
- Integration test: call protected endpoints without Authorization header -> 401
- Integration test: call protected endpoints with malformed JWT -> 401
- Integration test: call protected endpoints with valid JWT -> passes through
- Verify existing vitest integration suite passes after wiring

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-17):
@kody

**@aharonyaircohen** (2026-04-17):
🚀 Kody pipeline started: `2451-260417-235038`

