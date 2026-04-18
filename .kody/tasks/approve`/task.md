# Audit and apply withAuth to unprotected routes

## Context
The `withAuth` HOC exists in `src/auth/withAuth.ts` and is already applied to routes like `/api/notes`, `/api/enroll`, `/api/quizzes`. However, based on the spec which says "Add auth middleware to protect existing routes", some routes may not be protected.

This task verifies auth protection on all API routes and applies `withAuth` to any that are missing it.

## Acceptance Criteria
- All `src/app/api/` routes that access user data or perform authenticated operations are wrapped with `withAuth`
- Public routes (health, CSRF token) remain unprotected
- Protected routes enforce appropriate RBAC roles via `withAuth({ roles: [...] })`
- Route handlers that manually check `user` object are converted to use `withAuth`

## Test Strategy
- Code review: list all route handlers and verify auth coverage
- Manual: invoke each protected endpoint without token and verify 401 response
- Manual: invoke each protected endpoint with valid token and verify access

---

## Discussion (14 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2709-260418-124334`

**@aharonyaircohen** (2026-04-18):
🤔 **Kody has questions before proceeding:**

1. Should `src/app/my-route/route.ts` be deleted (it's an example stub, not a real API endpoint) or should it be converted to a protected route with a real purpose?
2. Do the notifications routes (GET /notifications, PATCH /notifications/[id]/read, POST /notifications/read-all) need explicit role restrictions added via `withAuth({ roles: [...] })`, or is any authenticated user acceptable?
3. The quiz submit and quiz attempts routes currently have no explicit roles (no `roles` option in withAuth). Should they be restricted to `['viewer', 'editor', 'admin']` to match the gradebook pattern, or left as any authenticated user?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `approve``

**@aharonyaircohen** (2026-04-18):
🤔 **Kody has questions before proceeding:**

1. Should src/app/my-route/route.ts be deleted (it's an example stub with no real purpose) or converted to a protected route with a real purpose?
2. Do the notifications routes (GET /notifications, PATCH /notifications/[id]/read, POST /notifications/read-all) need explicit role restrictions via withAuth({ roles: [...] }), or is any authenticated user acceptable?
3. Should the quiz submit and quiz attempts routes be restricted to ['viewer', 'editor', 'admin'] to match the gradebook pattern, or left open to any authenticated user?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `approve``

**@aharonyaircohen** (2026-04-18):
🤔 **Kody has questions before proceeding:**

1. Should src/app/my-route/route.ts be deleted (example stub with no real purpose) or converted to a protected route with real functionality?
2. Do the notifications routes (GET /notifications, PATCH /notifications/[id]/read, POST /notifications/read-all) need explicit role restrictions via withAuth({ roles: [...] }), or is any authenticated user acceptable?
3. Should the quiz submit and quiz attempts routes be restricted to ['viewer', 'editor', 'admin'] to match the gradebook pattern, or left as any authenticated user?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `approve``

**@aharonyaircohen** (2026-04-18):
🤔 **Kody has questions before proceeding:**

1. Should src/routes/notifications.ts be deleted? It duplicates src/app/api/notifications/ (GET) and src/app/api/notifications/read-all/ (POST), is outside the Next.js App Router tree, and also redundantly checks user inside the withAuth wrapper (withAuth already guarantees user is present — the inner if (!user) checks in src/app/api/notifications/route.ts are dead code).
2. The notifications routes (GET /notifications, PATCH /notifications/[id]/read, POST /notifications/read-all) require authentication but have no explicit roles, meaning any authenticated user can access them. Should they be restricted to specific roles via withAuth({ roles: [...] }), or is any authenticated user acceptable?
3. The quiz submit and quiz attempts routes (src/app/api/quizzes/[id]/submit/route.ts and .../attempts/route.ts) also have no explicit roles. Should they be restricted to ['viewer', 'editor', 'admin'] to match the gradebook pattern, or left as any authenticated user?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `approve``

**@aharonyaircohen** (2026-04-18):
🤔 **Kody has questions before proceeding:**

1. Should src/routes/notifications.ts be deleted? It duplicates src/app/api/notifications/ (GET) and src/app/api/notifications/read-all/ (POST), lives outside the Next.js App Router tree, and also redundantly checks `if (!user)` inside withAuth wrappers — withAuth already guarantees user is present, making those inner guards dead code.
2. Do the notifications routes (GET /notifications, PATCH /notifications/[id]/read, POST /notifications/read-all) need explicit role restrictions via `withAuth({ roles: [...] })`, or is any authenticated user acceptable as the current behavior implies?
3. Should the quiz submit and quiz attempts routes be restricted to `['viewer', 'admin', 'editor']` to match the gradebook pattern for consistency, or left as any authenticated user?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `approve``

**@aharonyaircohen** (2026-04-18):
🤔 **Kody has questions before proceeding:**

1. Should src/app/my-route/route.ts be deleted (example stub with no real purpose) or converted to a protected route with real functionality?
2. The notifications routes (GET /notifications, PATCH /notifications/[id]/read, POST /notifications/read-all) currently allow any authenticated user. Should they be restricted to specific roles via withAuth({ roles: [...] }), or is any authenticated user acceptable?
3. The quiz submit and quiz attempts routes have no explicit roles. Should they be restricted to ['viewer', 'editor', 'admin'] to match the gradebook pattern for consistency, or left as any authenticated user?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `approve``

