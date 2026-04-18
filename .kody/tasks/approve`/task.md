# [run-20260418] P1T03: HIGH complexity triggers risk gate

Verify HIGH complexity task triggers the risk gate and pauses pipeline at plan stage.

Task: Replace the entire session-based authentication system with JWT-based authentication. Migrate the user schema to include jwt_secret, exp, and iat fields. Add RBAC with admin/editor/viewer roles. Update all API routes to use the new auth middleware. Run database migrations.

Command: @kody

## Verification
Pipeline should pause at plan stage (kody:paused label). Auto-approve monitor will resume it.

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2617-260418-095313`

**@aharonyaircohen** (2026-04-18):
🛑 **Risk gate: HIGH complexity — awaiting approval**

<details><summary>📋 Plan summary</summary>



The plan is ready for your review. It covers consolidating the dual auth system by migrating `src/api/auth/` routes from the old in-memory stores to the existing `AuthService`/`JwtService`/`withAuth` stack already in use by `src/app/api/**/` routes, then removing the legacy files.

Three open questions:
1. **`jwt_secret` field** — per-user or global env var?
2. **Old store removal** — delete directly or deprecate first?
3. **`UserRole` type cleanup** — remove after `user-store.ts` deletion?
</details>

To approve: `@kody approve`

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `approve``

