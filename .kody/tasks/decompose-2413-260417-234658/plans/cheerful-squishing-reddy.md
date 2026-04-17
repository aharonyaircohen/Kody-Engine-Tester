# Plan: Implement Notification System API Routes

## Context

The notification system is already mostly implemented:
- `src/models/notification.ts` ✅ (domain types)
- `src/services/notifications.ts` ✅ + `.test.ts` ✅ (service layer)
- `src/utils/notificationHelpers.ts` ✅ + `.test.ts` ✅ (helper utilities)
- `src/collections/Notifications.ts` ✅ + `.Notifications.collection.test.ts` ✅ (Payload CMS collection)
- `src/collections/NotificationsStore.ts` ✅ + `.test.ts` ✅ (in-memory store)
- `src/app/api/notifications/route.ts` ✅ (GET unread)
- `src/app/api/notifications/read-all/route.ts` ✅ (POST mark all read)

**Missing pieces** to make the implementation complete:
1. **`src/app/api/notifications/[id]/route.ts`** — Individual notification GET (mark as read) and PATCH (update)
2. **`src/app/api/notifications/[id]/route.test.ts`** — Tests for the above route
3. **`src/app/api/notifications/route.test.ts`** — Tests for the main notifications route
4. **`src/app/api/notifications/read-all/route.test.ts`** — Tests for the read-all route
5. **Remove `src/routes/notifications.ts`** — Legacy non-App-Router file (superseded by `src/app/api/notifications/`)

## Approach

Follow the established patterns from `src/app/api/notes/[id]/route.ts`:
- Use `withAuth` with `{ optional: true }` for GET, `{ roles: ['admin', 'editor'] }` for PATCH, `{ roles: ['admin'] }` for DELETE
- Async params via `routeParams?.params`
- Return `Response` objects with appropriate status codes
- Import `NotificationService` from `@/services/notifications`

## Files to Create/Modify

### New: `src/app/api/notifications/[id]/route.ts`
```
GET  — retrieve notification by id, mark as read (optional auth)
PATCH — update notification fields (admin/editor only)
DELETE — delete notification (admin only)
```

### New: `src/app/api/notifications/[id]/route.test.ts`
- Test GET returns 404 for non-existent id
- Test GET returns notification and marks it read
- Test GET returns 401 for unauthenticated (when optional is removed later)
- Test PATCH returns 404 for non-existent id
- Test PATCH updates fields correctly
- Test DELETE returns 204 for valid id
- Test DELETE returns 404 for non-existent id

### New: `src/app/api/notifications/route.test.ts`
- Test GET returns 401 when not authenticated
- Test GET returns notifications array for authenticated user
- Test POST (mark all read) returns success

### New: `src/app/api/notifications/read-all/route.test.ts`
- Test POST marks all as read and returns success

### Delete: `src/routes/notifications.ts`
- This legacy file is superseded by `src/app/api/notifications/`

## Verification
1. Run `pnpm test:int` — all notification-related tests pass
2. Run `pnpm tsc --noEmit` — zero type errors
3. Run `pnpm lint` (if available)
