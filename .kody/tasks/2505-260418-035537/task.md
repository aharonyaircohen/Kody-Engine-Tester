# Verify auth middleware protects all existing routes

## Context
All API routes should require authentication except intentionally public ones (health, CSRF). The `withAuth` HOC exists and is already applied to most routes, but a systematic verification ensures no gaps exist. This task audits and confirms protection coverage.

## Acceptance Criteria
- All protected API routes under `src/app/api/` (except `/health` and `/csrf-token`) use `withAuth`
- Protected routes enforce appropriate roles via `withAuth({ roles: [...] })`
- Public routes (`/health`, `/csrf-token`) remain unprotected as intended
- All frontend pages (`src/app/(frontend)/*`) perform auth checks via `payload.auth()` and redirect when unauthenticated
- Pages enforce role-based access (e.g., dashboard for students only)

## Test Strategy
- Audit route handlers in `src/app/api/` to confirm `withAuth` usage
- Verify `withAuth` is used with appropriate role restrictions
- Check frontend pages in `src/app/(frontend)/` for auth redirect logic
- No code changes expected — this is a verification task to confirm the auth surface is complete


---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2505-260418-035537`

