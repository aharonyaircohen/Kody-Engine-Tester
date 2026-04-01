# Notification System Feature

Add a user notification system to support in-app alerts.

## Tasks

1. Add Notification data types and constants (`src/notifications/types.ts`)
   - Define `NotificationType`, `Notification`, and `NotificationStatus` types
   - Add severity constants: INFO, WARNING, ERROR

2. Add notification service (`src/notifications/service.ts`) — depends on types
   - `createNotification(userId, type, message)` function
   - `getUserNotifications(userId)` function
   - `markAsRead(notificationId)` function

3. Add notification API route handlers (`src/notifications/api.ts`) — depends on service
   - GET /api/notifications — list for current user
   - POST /api/notifications/read — mark as read
   - Input validation using existing validation patterns
