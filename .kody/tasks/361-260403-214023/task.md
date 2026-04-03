# [test-suite] Decompose: complex multi-area task

Add a complete notification system:
1. Create a notification model in src/models/notification.ts with types (info, warning, error) and read/unread status
2. Create notification service in src/services/notificationService.ts with CRUD operations and mark-as-read
3. Add notification API routes in src/routes/notifications.ts (GET /notifications, POST /notifications, PATCH /notifications/:id/read)
4. Add notification utility helpers in src/utils/notificationHelpers.ts for formatting and filtering
5. Add unit tests for all new modules