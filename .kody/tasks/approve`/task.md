# [run-20260418] P1T03: HIGH complexity triggers risk gate

Verify HIGH complexity task triggers the risk gate and pauses pipeline at plan stage.

Task: Replace the entire session-based authentication system with JWT-based authentication. Migrate the user schema to include jwt_secret, exp, and iat fields. Add RBAC with admin/editor/viewer roles. Update all API routes to use the new auth middleware. Run database migrations.

Command: @kody

---

## Discussion (6 comments)

**@aharonyaircohen** (2026-04-18):
@kody

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `2699-260418-123927`

**@aharonyaircohen** (2026-04-18):
🤔 **Kody has questions before proceeding:**

1. Should the session store be fully removed or kept as a fallback during a migration window?
2. How should existing users be provisioned with JWT secrets — auto-generated on migration, or lazily on next login?
3. How should existing users be mapped to the new RBAC roles (admin/editor/viewer)? Should admins designate role assignments manually, or should legacy roles (student/instructor) be defaulted to a specific role?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `approve``

**@aharonyaircohen** (2026-04-18):
🤔 **Kody has questions before proceeding:**

1. Should the session store be fully removed or kept as a fallback during a migration window?
2. How should existing users be provisioned with JWT secrets — auto-generated on migration, or lazily on next login?
3. How should existing users be mapped to the new RBAC roles (admin/editor/viewer)? Should admins designate role assignments manually, or should legacy roles (student/instructor) be defaulted to a specific role?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `approve``

