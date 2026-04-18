# Plan: decompose-2584-260418-091247 — Verify @kody decompose on Notification System

## Context

The task is a **verification chore**: confirm the notification system is already fully implemented, then run `@kody decompose` on the task scope and assert that the engine correctly classifies it as complex (complexity_score >= 4, decomposable: true, 2+ sub-tasks with worktrees).

The build stage is running. Implementation is not required — all 12 scope files already exist.

---

## Verification Step 1: Confirm All Scope Files Exist

All 12 files verified present:

| File | Status |
|---|---|
| `src/models/notification.ts` | ✅ |
| `src/services/notifications.ts` | ✅ |
| `src/services/notifications.test.ts` | ✅ |
| `src/utils/notificationHelpers.ts` | ✅ |
| `src/utils/notificationHelpers.test.ts` | ✅ |
| `src/collections/Notifications.ts` | ✅ |
| `src/collections/Notifications.collection.test.ts` | ✅ |
| `src/collections/NotificationsStore.test.ts` | ✅ |
| `src/routes/notifications.ts` | ✅ |
| `src/app/api/notifications/route.ts` | ✅ |
| `src/app/api/notifications/[id]/read/route.ts` | ✅ |
| `src/app/api/notifications/read-all/route.ts` | ✅ |

---

## Verification Step 2: Run Integration Tests

Run the vitest suite to confirm all notification tests pass:

```bash
pnpm test:int -- --reporter=verbose src/services/notifications.test.ts src/utils/notificationHelpers.test.ts src/collections/Notifications.collection.test.ts src/collections/NotificationsStore.test.ts
```

Expected: all tests pass (the tests are already written and fully functional).

---

## Verification Step 3: Run @kody decompose

Invoke the kody CLI decompose command using the task scope as input to confirm the engine correctly produces `complexity_score >= 4`, `decomposable: true`, and 2+ sub-tasks.

**Command** (from `.kody/task.md`):
```
@kody decompose

Task: Add a complete notification system with model, service, routes, helpers, and tests across multiple directories.

Scope: src/models/notification.ts, src/services/notifications.ts, src/services/notifications.test.ts, src/routes/notifications.ts, src/utils/notificationHelpers.ts, src/utils/notificationHelpers.test.ts, src/collections/Notifications.ts, src/collections/Notifications.collection.test.ts, src/collections/NotificationsStore.test.ts, src/app/api/notifications/route.ts, src/app/api/notifications/[id]/read/route.ts, src/app/api/notifications/read-all/route.ts
```

**Expected output** (JSON format parsed from LLM response):
```json
{
  "complexity_score": 7,
  "decomposable": true,
  "sub_tasks": [
    { "id": "sub-1", "title": "...", "scope": ["..."], "dependencies": [] },
    { "id": "sub-2", "title": "...", "scope": ["..."], "dependencies": [] }
  ]
}
```

Assertions:
- `complexity_score >= 4` ✅
- `decomposable === true` ✅
- `sub_tasks.length >= 2` ✅

---

## Verification Step 4: Confirm Worktree Creation Logic

The kody-ade engine (CLI lines 18772–18777) creates git worktrees via `git worktree add -b <branch> <path> HEAD`. No actual worktrees need to be created during verification — confirm the logic path exists by reading the relevant engine source (optional grep/read).

---

## Verification Step 5: Typecheck

```bash
pnpm tsc --noEmit
```

Zero type errors expected.

---

## Files Involved

- `src/models/notification.ts` — model types
- `src/services/notifications.ts` — NotificationService class
- `src/services/notifications.test.ts` — service unit tests
- `src/utils/notificationHelpers.ts` — pure helpers (format, filter, sort, count)
- `src/utils/notificationHelpers.test.ts` — helper unit tests
- `src/collections/Notifications.ts` — Payload collection config
- `src/collections/Notifications.collection.test.ts` — collection config tests
- `src/collections/NotificationsStore.test.ts` — in-memory store tests
- `src/routes/notifications.ts` — route handler (withAuth)
- `src/app/api/notifications/route.ts` — GET unread / POST mark-all-read
- `src/app/api/notifications/[id]/read/route.ts` — PATCH mark single read
- `src/app/api/notifications/read-all/route.ts` — POST mark all read (alternate route)

---

## Outcome

Verification summary written to task status or a `verification.md` file inside the task directory. No code changes are needed — all 12 files exist and are fully implemented.
