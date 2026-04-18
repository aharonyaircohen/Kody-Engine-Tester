# [kody-lean test] Add Vitest for src/utils/format-bytes.ts

Create a small utility `src/utils/format-bytes.ts` exporting a function `formatBytes(bytes: number): string` that formats byte counts as human-readable strings:
- < 1024 → `${n}B`
- < 1024*1024 → `${n.toFixed(1)}KB`
- < 1024*1024*1024 → `${n.toFixed(1)}MB`
- otherwise → `${n.toFixed(1)}GB`

Also create `src/utils/format-bytes.test.ts` covering each branch.

This is a multi-file post-publish smoke test for kody-lean v0.5.0.

---

## Discussion (4 comments)

**@aguyaharonyair** (2026-04-18):
⚙️ kody2 started — branch `2861-kody-lean-test-add-vitest-for-srcutilsformat-bytes`

**@aguyaharonyair** (2026-04-18):
⚠️ kody2 FAILED: verify failed: typecheck, test, lint

--- typecheck (exit 1, 1.5s) ---
src/app/(frontend)/instructor/courses/[id]/edit/page.tsx(14,11): error TS2339: Property 'id' does not exist on type '{ id: string; } | null'.
src/app/(frontend)/notes/[id]/page.tsx(12,11): error TS2339: Property 'id' does not exist on type '{ id: string; } | null'.
src/app/(frontend)/notes/edit/[id]/page.tsx(11,11): error TS2339: Property 'id' does not exist on type '{ id: string; } | null'.
src/pages/contacts/detail/page.tsx(12,14): error TS18047: 'searchParams' is possibly 'null'.
src/pages/contacts/form/page.tsx(16,18): error TS18047: 'searchParams' is possibly 'null'.
src/utils/bad-types.ts(2,3): error TS2322: Type 'number' is not assignable to type 'string'.
tests/helpers/seedUser.ts(26,24): error TS2345: Argument of type '{ collection: "users"; data: { email: string; password: string; }; draft: false; }' is not assignable to parameter of type 'Options<"users", UsersSelect<false> | UsersSelect<true>>'.
  Types of property 'data' are incompatible.
    Type '{ email: string; password: string; }' is not assignable to type 'Omit<User, "createdAt" | "deletedAt" | "updatedAt" | "id" | "collection"> & Partial<Pick<User, "createdAt" | "deletedAt" | "updatedAt" | "id" | "collection">>'.
      Type '{ email: string; password: string; }' is missing the following properties from type 'Omit<User, "createdAt" | "deletedAt" | "updatedAt" | "id" | "collection">': firstName, lastName, role


--- test (exit 1, 7.3s) --… (+2621 chars) — draft PR: https://github.com/aharonyaircohen/Kody-Engine-Tester/pull/2862

**@aguyaharonyair** (2026-04-18):
Closed — kody-lean v0.5.0 post-publish test passed.

**@aharonyaircohen** (2026-04-18):
🚀 Kody pipeline started: `-Engine-Tester/pull/2862`

