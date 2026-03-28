
### taskify (2026-03-28T22:25:27)
{
  "task_type": "chore",
  "title": "Add unit tests for notification service event dispatching",
  "description": "Add comprehensive unit tests for the notification service that handles LMS event dispatching. Tests cover enrollment, grade-posted, and certificate-issued events, subscriber notification, event payload passing, and unknown event type handling.",
  "scope": ["src/services/notification-service.ts", "src/services/notification-service.test.ts"],
  "risk_level": "low",
  "questions": []
...(truncated)

### build (2026-03-28T22:28:49)
All 6 tests pass with zero TypeScript errors. Here's what was created:

**`src/services/notification-service.ts`**
- `NotificationService` with `NotificationServiceDeps` dependency contract (data layer mocked in tests)
- `dispatch(event)` — routes to the correct handler by event type; unknown types silently ignored via exhaustive switch
- `subscribe(handler)` — returns an unsubscribe function; all subscribers receive every event
- Handlers: `enrollment` → `success/system`, `grade-posted` → `info
...(truncated)
