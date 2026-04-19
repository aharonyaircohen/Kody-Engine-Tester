# [kody-lean] feat: certificate generation endpoint

Add an endpoint that generates a course-completion certificate when a student finishes all lessons in a course.

## Endpoint

`POST /api/certificates/generate` at `src/app/api/certificates/generate/route.ts`

## Behavior

- Accepts JSON body: `{ studentId: string, courseId: string }`
- Fetches the Enrollment for that `(student, course)` pair via Payload. If not enrolled → 403 `{ success: false, error: 'Not enrolled' }`.
- Fetches all Lessons in the course (joined via Modules → Course). If the enrollment's progress doesn't cover every lesson → 400 `{ success: false, error: 'Course not complete' }`.
- Otherwise: create a Certificates record with `student`, `course`, `issuedAt: now`, `certificateNumber: <unique>` (e.g. `CERT-<courseId-prefix>-<timestamp-base36>`), `finalGrade` from the gradebook if available (otherwise omit). Returns 201 with `{ success: true, data: <certificate> }`.
- If a Certificate already exists for the pair → 200 `{ success: true, data: <existing> }` (idempotent).

## Requirements

- Use the `Certificates` collection (`src/collections/certificates.ts`) and existing `Enrollments`, `Modules`, `Lessons` collections.
- Use `getPayload` like other custom endpoints (reference: `src/app/api/enroll/route.ts` if it exists, otherwise mirror `src/app/api/quizzes/[id]/submit/route.ts`).
- Generate `certificateNumber` deterministically enough to be tested (e.g. `CERT-${courseIdShort}-${Date.now().toString(36).toUpperCase()}`).
- Add `src/app/api/certificates/generate/route.test.ts` covering: not enrolled (403), incomplete (400), happy path (201), idempotent re-generate (200).
- All quality gates must pass for the new files.

Heaviest smoke test for kody-lean v0.5.0 — multi-collection joins, business logic, idempotency, multiple error paths.

---

## Discussion (4 comments)

**@aguyaharonyair** (2026-04-19):
⚙️ kody2 started — branch `2866-kody-lean-feat-certificate-generation-endpoint`

**@aguyaharonyair** (2026-04-19):
⚠️ kody2 FAILED: verify failed: typecheck, test, lint

--- typecheck (exit 2, 1.7s) ---
src/app/(frontend)/instructor/courses/[id]/edit/page.tsx(14,11): error TS2339: Property 'id' does not exist on type '{ id: string; } | null'.
src/app/(frontend)/notes/[id]/page.tsx(12,11): error TS2339: Property 'id' does not exist on type '{ id: string; } | null'.
src/app/(frontend)/notes/edit/[id]/page.tsx(11,11): error TS2339: Property 'id' does not exist on type '{ id: string; } | null'.
src/app/api/certificates/generate/route.test.ts(80,13): error TS2339: Property '_gradebookSpyRef' does not exist on type 'typeof import("/Users/aguy/projects/Kody-Engine-Tester/src/services/gradebook-payload")'.
src/app/api/certificates/generate/route.test.ts(147,13): error TS2339: Property '_gradebookSpyRef' does not exist on type 'typeof import("/Users/aguy/projects/Kody-Engine-Tester/src/services/gradebook-payload")'.
src/pages/contacts/detail/page.tsx(12,14): error TS18047: 'searchParams' is possibly 'null'.
src/pages/contacts/form/page.tsx(16,18): error TS18047: 'searchParams' is possibly 'null'.
src/utils/bad-types.ts(2,3): error TS2322: Type 'number' is not assignable to type 'string'.
tests/helpers/seedUser.ts(26,24): error TS2345: Argument of type '{ collection: "users"; data: { email: string; password: string; }; draft: false; }' is not assignable to parameter of type 'Options<"users", UsersSelect<false> | UsersSelect<true>>'.
  Types of property 'data' are incompatible.
    Type '{ email: string; password: s… (+3046 chars) — draft PR: https://github.com/aharonyaircohen/Kody-Engine-Tester/pull/2869

**@aguyaharonyair** (2026-04-19):
Closed \u2014 kody-lean v0.5.0 heavy test passed.

**@aharonyaircohen** (2026-04-19):
🚀 Kody pipeline started: `-Engine-Tester/src/services/gradebook-payload")'.`

