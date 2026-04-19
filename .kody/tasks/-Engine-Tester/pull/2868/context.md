
### taskify (2026-04-19T04:21:29)
{
  "task_type": "feature",
  "title": "Add assignment submission endpoint",
  "description": "Add a POST /api/assignments/[id]/submit endpoint that accepts { studentId, content, attachmentIds? }, returns 404 if assignment not found, 400 if past due, 409 if duplicate submission, and 201 with the created Submissions record on success. Follow the quiz submit endpoint pattern, use getPayload, and add route tests covering all four cases.",
  "scope": [
    "src/app/api/assignments/[id]/submit/route.
...(truncated)

### plan (2026-04-19T04:22:21)


Now I have all the context needed. Let me write the plan.

---

## Implementation Plan: Assignment Submission Endpoint

**Pattern discovered:** The quiz submit endpoint (`src/app/api/quizzes/[id]/submit/route.ts`) is the reference pattern — it uses `getPayload({ config: configPromise })`, `withAuth`, `findByID` to validate the entity, and returns `{ success, data }` or `{ success: false, error }` responses. The enroll route shows the 409 duplicate pattern with `payload.find`.

---

## Step 1: 
...(truncated)

### build (2026-04-19T04:28:06)
That notification is from the earlier full suite run — the integration test failure (`tests/int/api.int.spec.ts`) is a pre-existing infrastructure issue (PostgreSQL not available in this environment), not related to my changes.

The focused run of just the new route test file passed cleanly:

```
✓ src/app/api/assignments/[id]/submit/route.test.ts (6 tests) 19ms
  Test Files  1 passed (1)
       Tests  6 passed (6)
```

No further action needed — all new code is complete and passing.

### review (2026-04-19T04:31:10)


## Verdict: FAIL

## Summary

The PR adds a `POST /api/assignments/[id]/submit` endpoint and co-located tests. Two critical security issues exist: the authenticated user's identity is bypassed via a `studentId` body parameter (allowing any student to impersonate another), and a race condition on the duplicate-check-then-insert allows concurrent duplicate submissions. Both must be fixed before merge.

---

## Findings

### Critical

- `route.ts:49` — The route accepts `studentId` from the reque
...(truncated)

### review-fix (2026-04-19T04:37:38)
All fixes complete. Here's a summary of what was done:

## Fixes Applied

### Critical Issues

**1. Authorization bypass (`route.ts:49` — `studentId` from body)**
- `SubmitBody.studentId` was removed entirely
- The route now uses `user!.id` (from the authenticated context passed by `withAuth`) for both the submission record and all lookups
- No student can impersonate another via a body parameter

**2. Race condition (TOCTOU on check-then-insert)**
- Removed the `payload.find` duplicate check th
...(truncated)

### review (2026-04-19T04:39:00)
Now I have everything I need. Let me write the structured review.

---

## Verdict: FAIL

## Summary

The PR adds a `POST /api/assignments/[id]/submit` endpoint and tests. The previous review's auth bypass (studentId from body) is correctly fixed — `user.id` is now used from the authenticated context. However, there is one critical gap: the route's 409 duplicate-detection logic relies on a DB unique constraint that **does not exist** in the `Submissions` schema, so concurrent submissions will si
...(truncated)

### review-fix (2026-04-19T04:41:35)
All Major findings are resolved. Here's a summary of every fix applied:

---

## Fixes Applied

### Major — Missing DB unique constraint on `Submissions`

**`src/collections/Submissions.ts`** — Added the `indexes` array following the `Enrollments.ts` pattern:
```typescript
indexes: [
  { fields: ['assignment', 'student'], unique: true },
],
```
This makes the `catch` block at `route.ts:90` reachable — concurrent `payload.create` calls will now throw a real Postgres unique-violation error that th
...(truncated)

### review (2026-04-19T04:43:39)
Now I have the full picture. Let me compile the review.

## Verdict: PASS

## Summary

The PR adds `POST /api/assignments/[id]/submit` — a student-facing endpoint that creates a `Submissions` record for a given assignment. It correctly uses `user.id` from the authenticated `withAuth` context (not the body), leverages the DB unique constraint on `(assignment, student)` in `Submissions.ts` for race-safe duplicate detection, and includes comprehensive tests covering all four required cases plus ext
...(truncated)
