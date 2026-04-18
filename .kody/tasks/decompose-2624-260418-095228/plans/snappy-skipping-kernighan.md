# Plan: Verify Notification System Implementation (decompose-2624-260418-095228 — Build Stage)

## Context

This task is the **build stage** of the `@kody decompose` pipeline. The `taskify` stage produced a `task.json` with scope covering 6 notification system files. The goal here is to verify that all components already exist and are correctly implemented, then run tests to confirm correctness.

## Verification Summary

All 6 scoped files exist and are correctly implemented:

| File | Status | Notes |
|------|--------|-------|
| `src/models/notification.ts` | ✅ | Exports `NotificationSeverity`, `Notification`, `NotificationFilter` |
| `src/services/notifications.ts` | ✅ | `NotificationService` with Payload SDK; `notify`, `getUnread`, `markRead`, `markAllRead` |
| `src/services/notifications.test.ts` | ✅ | 5 vitest tests using `vi.fn()` mock Payload; all pass |
| `src/routes/notifications.ts` | ✅ | GET/POST handlers with `withAuth` HOC; uses `getPayloadInstance()` |
| `src/utils/notificationHelpers.ts` | ✅ | Pure utils: `formatNotification`, `filterNotifications`, `getUnreadCount`, `sortBySeverity` |
| `src/utils/notificationHelpers.test.ts` | ✅ | 13 vitest tests using factory mock pattern; all pass |

## Test Results

- **`pnpm test:int src/services/notifications.test.ts`** — 5/5 passed
- **`pnpm test:int src/utils/notificationHelpers.test.ts`** — 13/13 passed
- **`pnpm tsc --noEmit`** — No TypeScript errors for notification files
- `NotificationType` is correctly imported from `src/collections/Notifications.ts` (which exports `type NotificationType = 'enrollment' | 'grade' | 'deadline' | 'discussion' | 'announcement'`)

## Minor Observations (not blocking)

- `NotificationService` has a `// FIXME` comment about bulk notifications being sent one-by-one — this is a known design issue, not a bug
- The routes file only exposes GET (list unread) and POST (mark all read); no individual `markRead(id)` route — consistent with the service layer

## Files Referenced

- `src/models/notification.ts`
- `src/services/notifications.ts`
- `src/services/notifications.test.ts`
- `src/routes/notifications.ts`
- `src/utils/notificationHelpers.ts`
- `src/utils/notificationHelpers.test.ts`
- `src/collections/Notifications.ts` (provides `NotificationType`)

## Verification Steps Completed

1. ✅ All 6 scoped files exist on disk
2. ✅ Each file exports the expected symbols (types/interfaces, classes, functions)
3. ✅ `NotificationService` uses Payload SDK constructor injection pattern (matches `GradebookService`)
4. ✅ Route handlers use `withAuth` HOC pattern (matches existing API routes)
5. ✅ Helper functions use pure function + JSDoc pattern (matches `debounce.ts`, `result.ts`)
6. ✅ All 18 tests pass (vitest with `vi.fn()` mock pattern)
7. ✅ No TypeScript compilation errors
8. ✅ `NotificationType` is properly exported from `src/collections/Notifications.ts`

## Conclusion

The notification system is fully implemented and verified. No code changes are required — this task serves as a correctness confirmation that `@kody decompose` correctly identified all components of the complex multi-area task.
