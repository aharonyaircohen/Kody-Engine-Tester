
### taskify (2026-04-05T06:00:49)
Based on my exploration, the notification system already exists in this codebase:
- Model: `src/collections/Notifications.ts` with `NotificationType` 
- Service: `src/services/notifications.ts` with `NotificationService` (CRUD + markRead + markAllRead)
- API routes: `src/app/api/notifications/route.ts`, `src/app/api/notifications/read-all/route.ts`, `src/app/api/notifications/[id]/read/route.ts`
- Tests: `src/services/notifications.test.ts` with full coverage

What's missing (that the task asks 
...(truncated)

### plan (2026-04-05T06:01:38)
Now I have enough context. Let me write the plan.

## Existing Patterns Found

- **Utility module pattern** (`src/utils/group-by.ts`, `src/utils/format-number.ts`): Single-responsibility files with typed interfaces, JSDoc comments, and `@example` sections
- **Service pattern** (`src/services/notifications.ts`): Class-based with Payload dependency, returns typed results
- **API route pattern** (`src/app/api/notifications/route.ts`): Uses `withAuth` HOC, returns `Response` with JSON
- **Test patte
...(truncated)

### build (2026-04-05T06:04:03)
**Implementation complete.** Here's a summary of what was created:

| File | Description |
|------|-------------|
| `src/models/notification.ts` | Notification domain model types (`NotificationSeverity`, `Notification`, `NotificationFilter`) |
| `src/utils/notificationHelpers.ts` | Utility functions: `formatNotification`, `filterNotifications`, `getUnreadCount`, `sortBySeverity` |
| `src/utils/notificationHelpers.test.ts` | 13 unit tests covering all helper functions |
| `src/routes/notification
...(truncated)
