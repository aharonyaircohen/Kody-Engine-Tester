
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
