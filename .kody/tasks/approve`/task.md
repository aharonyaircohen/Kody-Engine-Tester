# Audit and apply withAuth middleware to all protected routes

## Context
The `withAuth` HOC exists at `src/auth/withAuth.ts` and is already used by most API routes (notes, quizzes, gradebook, enroll, notifications, admin-stats, courses/search). Routes that may not need auth: `health` (intentionally public), `csrf-token` (validates session via `x-session-id` header). All other routes that access user data must be protected.

## Acceptance Criteria
- All routes in `src/app/api/` that access user-specific or restricted data use `withAuth`
- Unauthenticated requests to protected routes return `401 Unauthorized`
- Role-based access (`roles: ['admin', 'editor', 'viewer']`) is applied where appropriate
- `health/route.ts` remains public (intentionally unauthenticated)
- `csrf-token/route.ts` is reviewed and protected if it accesses user data

---

## Discussion (10 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2712-260418-124336`

**@aharonyaircohen** (2026-04-18):
🤔 **Kody has questions before proceeding:**

1. Should notes/[id]/route.ts GET handler have its redundant if (!user) guard removed (already guaranteed by withAuth)?
2. Should quizzes/[id]/attempts/route.ts and quizzes/[id]/submit/route.ts have explicit { roles: ['viewer', 'editor', 'admin'] } added for clarity, or is the current no-roles (any authenticated user) behavior intentional?
3. Is there a missing /api/courses/search/route.ts concern around optional: true allowing unauthenticated search — should that be fully protected?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `approve``

**@aharonyaircohen** (2026-04-18):
🤔 **Kody has questions before proceeding:**

1. Should csrf-token/route.ts be protected with withAuth({ roles: ['admin', 'editor', 'viewer'] }) and the x-session-id header used to validate the session belongs to the authenticated user, or is the current unauthenticated token-generation intentionally open (CSRF-factory style)?
2. The notes/[id]/route.ts GET handler uses withAuth({ optional: true }) and has no redundant guard — did you mean notes/route.ts POST (which has the redundant check on line 54)?
3. Should quizzes/[id]/attempts GET and quizzes/[id]/submit POST get explicit { roles: ['viewer', 'editor', 'admin'] }, or is the current any-authenticated-user behavior (no roles key) the intended design?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `approve``

**@aharonyaircohen** (2026-04-18):
🤔 **Kody has questions before proceeding:**

1. Should csrf-token/route.ts be protected with withAuth({ roles: ['admin', 'editor', 'viewer'] }) so the x-session-id header is validated against the authenticated user's session, or is the current unauthenticated token-generation intentionally open (CSRF-factory style)?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `approve``

**@aharonyaircohen** (2026-04-18):
🏗️ **Kody has architecture questions:**

1. **Should `quizzes/[id]/attempts/route.ts` GET and `quizzes/[id]/submit/route.ts` POST get explicit `{ roles: ['viewer', 'editor', 'admin'] }` added, or is the current any-authenticated-user behavior (no roles key) intentional?** My recommendation: leave it as-is — any authenticated user (student or instructor) should be able to take a quiz and view their attempts. Adding a roles restriction would break student access without a clear reason.

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `approve``

