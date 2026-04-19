# [kody-lean] feat: assignment submission endpoint

Add a student-facing endpoint to submit work for an assignment.

## Endpoint

`POST /api/assignments/[id]/submit` at `src/app/api/assignments/[id]/submit/route.ts`

## Behavior

- Accepts JSON body: `{ studentId: string, content: object (rich text), attachmentIds?: string[] }`
- Looks up the assignment by `id`. If not found → 404.
- If the assignment has a `dueDate` that's already passed → 400 `{ success: false, error: 'Assignment past due' }`.
- If a Submission already exists for the same `(assignment, student)` pair → 409 `{ success: false, error: 'Already submitted' }`.
- On success: create a Submissions record with `assignment`, `student`, `content`, `attachments` (from `attachmentIds`), `submittedAt: now`, `status: 'submitted'`. Return 201 with `{ success: true, data: <submission> }`.

## Requirements

- Use Payload CMS APIs (`getPayload`) following the pattern in other custom endpoints (look at `src/app/api/quizzes/[id]/submit/route.ts` for a reference).
- Use the existing `Submissions` collection (`src/collections/Submissions.ts`) — do not modify the schema.
- Keep the route handler small; helpers can go alongside if needed.
- Add `src/app/api/assignments/[id]/submit/route.test.ts` covering: missing assignment (404), past due (400), duplicate submission (409), happy path (201).
- All quality gates must pass for the new files.

Heavy-duty smoke test #2 for kody-lean v0.5.0.

---

## Discussion (3 comments)

**@aguyaharonyair** (2026-04-19):
⚙️ kody2 started — branch `2865-kody-lean-feat-assignment-submission-endpoint`

**@aguyaharonyair** (2026-04-19):
⚠️ kody2 FAILED: verify failed: typecheck, test, lint

--- typecheck (exit 2, 1.6s) ---
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


--- test (exit 1, 7.8s) --… (+2621 chars) — draft PR: https://github.com/aharonyaircohen/Kody-Engine-Tester/pull/2868

**@aharonyaircohen** (2026-04-19):
🚀 Kody pipeline started: `-Engine-Tester/pull/2868`

