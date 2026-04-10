# [mem-20260410-0601] M10: Add role hierarchy checker

Create `hasPermission(userRole: string, requiredRole: string): boolean` in `src/auth/role-hierarchy.ts` with hierarchy admin > editor > viewer > guest. With tests

---

## Discussion (5 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1389-260410-062559` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24229674598))

To rerun: `@kody rerun 1389-260410-062559 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🤔 **Kody has questions before proceeding:**

1. The specified hierarchy (admin > editor > viewer > guest) differs from existing UserRole type ('admin' | 'user' | 'guest' | 'student' | 'instructor'). Should this function coexist with the existing role system, or should UserRole be updated to use the new roles?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1389-260410-070823` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24231035769))

To rerun: `@kody rerun 1389-260410-070823 --from <stage>`

