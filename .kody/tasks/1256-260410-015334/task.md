# [run-20260410-0144] T03: Redesign auth system with JWT and RBAC

## Task
Redesign the entire authentication system:

1. **Replace session-based auth with JWT**: Remove all session-store.ts usage, implement JWT tokens with RS256 signing
2. **Migrate user schema**: Add roles field, remove session-related fields, add token version for revocation
3. **Add RBAC with three roles**:
   - `admin`: full access to all routes including user management
   - `editor`: can create/edit own content, read all
   - `viewer`: read-only access
4. **Update all API routes** in src/auth/ and add role checks to all protected routes
5. **Add role-guard middleware** that checks JWT claims against required role
6. **Add token refresh endpoint** `POST /auth/refresh`
7. **Add token revocation** `POST /auth/revoke`
8. **Update tests** to cover all new functionality

## Files to modify/create
- `src/auth/jwt-service.ts` — JWT signing/verification with RS256
- `src/auth/user-store.ts` — new schema with roles and tokenVersion
- `src/auth/auth-service.ts` — new auth flow with JWT
- `src/middleware/role-guard.ts` — RBAC middleware
- `src/auth/refresh-token.ts` — token refresh logic
- `src/auth/revoke-token.ts` — token revocation
- All existing test files updated

## Risk Note
This is a HIGH complexity task spanning multiple files, security-critical code, and schema migrations. The pipeline should pause at the plan stage for human review before proceeding.

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1256-260410-014723` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24222255312))

To rerun: `@kody rerun 1256-260410-014723 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🤔 **Kody has questions before proceeding:**

1. Should the RS256 key pair be generated at runtime from environment variables, or should existing keys be loaded from files?
2. For token revocation, should we use a blacklist (current approach) or a version-based invalidation via tokenVersion field?
3. Should the legacy SessionStore be removed entirely or kept for backward compatibility during migration?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1256-260410-015334` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24222388938))

To rerun: `@kody rerun 1256-260410-015334 --from <stage>`

