# [kody-lean] feat: REST API for discussions

Discussions are a core part of LearnHub but only the in-memory store exists (`src/collections/Discussions.ts` exports `DiscussionsStore`). Add a complete REST API surface so the frontend and other clients can use them.

## Endpoints to create under `src/app/api/discussions/`

1. `GET /api/discussions?lesson=<lessonId>` → list posts for a lesson, newest first. Returns `{ success: true, data: DiscussionPost[] }`.
2. `POST /api/discussions` → create a post. Body: `{ lesson, author, content, parentPost? }`. Returns the created post.
3. `PATCH /api/discussions/[id]` → update content / pin / resolve flags.
4. `DELETE /api/discussions/[id]` → delete a post.

## Requirements

- Use the existing `DiscussionsStore` from `src/collections/Discussions.ts` — do not introduce a new store.
- Each route file in `src/app/api/discussions/` exporting Next.js App Router handlers (`GET`, `POST`, `PATCH`, `DELETE`).
- Match the API response envelope used elsewhere: `{ success: boolean, data?: T, error?: string }`.
- Validate inputs and return HTTP 400 on bad input, 404 when an ID doesn't resolve, 200/201 on success.
- A separate test file under `src/app/api/discussions/` for each route, covering happy path + at least one error path.
- All quality gates (`pnpm tsc --noEmit`, `pnpm test`, `pnpm lint`) must pass for the new files.

This is a heavier-duty smoke test for kody-lean v0.5.0 — multiple files, real domain logic, follow existing patterns.

---

## Discussion (10 comments)

**@aguyaharonyair** (2026-04-19):
⚙️ kody2 started — branch `2864-kody-lean-feat-rest-api-for-discussions`

**@aguyaharonyair** (2026-04-19):
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


--- test (exit 1, 8.0s) --… (+2621 chars) — draft PR: https://github.com/aharonyaircohen/Kody-Engine-Tester/pull/2867

**@aharonyaircohen** (2026-04-19):
🚀 Kody pipeline started: `-Engine-Tester/pull/2867`

**@aharonyaircohen** (2026-04-19):
🏗️ **Kody has architecture questions:**

1. Should `GET /api/discussions` (without `lesson` param) return all discussions (newest first) or strictly require the `lesson` param? The task says `?lesson=` is required — following that strictly, returning 400 when absent.

Reply with `kody approve` (prefix with @) and your answers in the comment body.

**@aguyaharonyair** (2026-04-19):
Closed \u2014 kody-lean v0.5.0 heavy test passed.

**@aguyaharonyair** (2026-04-19):
Re-opening to verify the kody-lean v0.5.1 PR body fix.

**@aguyaharonyair** (2026-04-19):
⚙️ kody2 started — branch `2864-kody-lean-feat-rest-api-for-discussions`

**@aguyaharonyair** (2026-04-19):
⚠️ kody2 FAILED: verify failed: typecheck, test, lint

--- typecheck (exit 1, 1.6s) ---
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


--- test (exit 1, 7.9s) --… (+2621 chars) — draft PR: https://github.com/aharonyaircohen/Kody-Engine-Tester/pull/2867

**@aguyaharonyair** (2026-04-19):
Closed \u2014 v0.5.1 PR body fix verified on this issue.

**@aharonyaircohen** (2026-04-19):
🚀 Kody pipeline started: `-Engine-Tester/pull/2867`

