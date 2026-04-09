
### taskify (2026-04-09T22:15:57)
All 8 tests pass. Here's the task classification:

```json
{
  "task_type": "feature",
  "title": "Add notification formatter",
  "description": "Create formatNotification(type: string, data: Record<string, string>): { subject: string; body: string } | null in src/services/notification-formatter.ts with templates for 'enrollment', 'grade', 'reminder' notification types. Includes comprehensive tests covering all three templates and edge cases.",
  "scope": ["src/services/notification-formatter.ts
...(truncated)

### build (2026-04-09T22:16:44)
The notification formatter is fully implemented and verified:

**Implementation Summary:**

- **`src/services/notification-formatter.ts`** - Contains `formatNotification(type, data)` function with:
  - `NotificationData` interface (optional fields: `studentName`, `courseName`, `assignmentName`, `grade`, `dueDate`)
  - Templates for `enrollment`, `grade`, and `reminder` notification types
  - Returns `{ subject, body }` or `null` for unknown types
  - Defaults for all optional fields

- **`src/se
...(truncated)

### autofix (2026-04-09T22:18:23)
Fixed `let context` to `const context` on line 80 of `src/utils/logger/index.ts`. The variable was never reassigned, so this is a straightforward const correctness improvement.

