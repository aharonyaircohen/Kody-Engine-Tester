# [run-20260410-1053] T03: Refactor auth system with migration

## Task
Redesign the entire authentication system: replace session-based auth with JWT, migrate the user schema, add RBAC with admin/editor/viewer roles, and update all API routes.

Specifically:
1. Replace `src/auth/session-store.ts` and `session-store.test.ts` with JWT-based token storage in `jwt-auth-store.ts` and `jwt-auth-store.test.ts`
2. Update `src/auth/user-store.ts` to include roles array and permissions mapping
3. Update `src/auth/auth-service.ts` to issue and verify JWTs instead of session cookies
4. Update `src/auth/_auth.ts` to use JWT middleware instead of session middleware
5. Update `src/auth/withAuth.ts` to check roles from JWT claims
6. Update all middleware files that depend on session auth
7. Add database migration file for adding roles column to users table
8. Update tests to work with the new JWT-based system

This is a HIGH complexity task that should trigger the risk gate and pause at plan stage.

---

## Discussion (5 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1543-260410-105455` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24239523980))

To rerun: `@kody rerun 1543-260410-105455 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🤔 **Kody has questions before proceeding:**

1. The existing auth-service.ts already uses JWT (via jwt-service.ts) and stores refresh tokens in Payload users collection. What specific functionality is missing that requires a new jwt-auth-store.ts versus using the existing jwt-service.ts pattern?
2. user-store.ts uses UserRole ('admin'|'user'|'guest'|'student'|'instructor') while auth-service.ts uses RbacRole ('admin'|'editor'|'viewer'). Should the task align these roles or maintain both role systems?
3. The auth-middleware.ts currently combines both sessionStore.findByToken AND jwtService.verify - should this be simplified to JWT-only, or is there a reason to keep session validation alongside JWT?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
@kody approve

Answers:
1. Please create jwt-auth-store.ts as a new file - the existing jwt-service.ts handles token creation/verification but doesn't handle token storage/refresh. The new file should manage persistent JWT storage.
2. Please align roles - use RbacRole ('admin'|'editor'|'viewer') from auth-service.ts and update user-store.ts to use the same role system.
3. The auth-middleware.ts should be updated to use JWT exclusively (not sessionStore). Remove session-based checks and use jwtService.verify only.

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1543-260410-105455` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24239991892))

To rerun: `@kody rerun 1543-260410-105455 --from <stage>`

