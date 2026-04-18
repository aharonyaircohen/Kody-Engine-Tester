# Protect existing routes with auth middleware

## Context
Existing routes need JWT authentication to prevent unauthorized access. The withAuth HOC already exists but may need enhancement to work with the new login/register flow.

## Acceptance Criteria
- Existing API routes are wrapped with withAuth or equivalent middleware
- Requests without valid JWT return 401
- Protected routes include: /api/notes, /api/enroll, /api/gradebook/*
- Middleware extracts Bearer token from Authorization header

## Test Strategy
- Integration test: call protected endpoint without token → 401
- Integration test: call protected endpoint with valid token → 200
- Integration test: call protected endpoint with expired/invalid token → 401

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2790-260418-164733`

