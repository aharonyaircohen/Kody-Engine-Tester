# [mem-20260409-1611] M10: Add role hierarchy checker

Create `hasPermission(userRole: string, requiredRole: string): boolean` in `src/auth/role-hierarchy.ts` with hierarchy admin > editor > viewer > guest. With tests

---

## Discussion (5 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `898-260409-162939` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24201415420))

To rerun: `@kody rerun 898-260409-162939 --from <stage>`

**@aharonyaircohen** (2026-04-09):
🤔 **Kody has questions before proceeding:**

1. The task specifies hierarchy admin > editor > viewer > guest, but RbacRole in auth-service.ts only includes 'admin' | 'editor' | 'viewer'. Should 'guest' be added to the RbacRole type, or should hasPermission only validate against the 4 specific roles in the hierarchy?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-09):
@kody approve

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `898-260409-162939` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24202474059))

To rerun: `@kody rerun 898-260409-162939 --from <stage>`

