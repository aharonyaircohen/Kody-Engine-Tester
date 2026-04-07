# [run-20260407-1802] T25: Decompose complex multi-area task

## Task
Test full decompose flow on a complex notification system task.

## Task Description
Add a complete notification system:
1. Create notification model in src/models/notification.ts with types (info, warning, error) and read/unread status
2. Create notification service in src/services/notificationService.ts with CRUD and mark-as-read
3. Add notification API routes in src/routes/notifications.ts (GET/POST/PATCH)
4. Add notification helpers in src/utils/notificationHelpers.ts for formatting and filtering
5. Add unit tests for all new modules

## Command
Comment on this issue: @kody decompose

## Expected
- complexity_score >= 6, decomposable: true
- 2+ sub-tasks in parallel worktrees
- Merge + verify + review + ship flow
- PR body has 'Decomposed Implementation' section
- Worktrees cleaned up