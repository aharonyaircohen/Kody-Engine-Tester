
### taskify (2026-04-10T07:10:55)
{
  "task_type": "feature",
  "title": "Add notification formatter service with enrollment, grade, and reminder templates",
  "description": "Create `src/services/notification-formatter.ts` with a `formatNotification(type: string, data: Record<string, string>): { subject: string; body: string }` function. The function should use template strings to generate localized subject and body text for 'enrollment', 'grade', and 'reminder' notification types. Include co-located tests in `notification-form
...(truncated)

### build (2026-04-10T07:13:10)
The notification formatter has been created successfully. Here's a summary:

**Created files:**

1. **`src/services/notification-formatter.ts`** - Notification formatter service with:
   - `formatNotification(type, data)` function returning `{ subject: string; body: string }`
   - Templates for `enrollment`, `grade`, and `reminder` notification types
   - Type definitions for each template data type

2. **`src/services/notification-formatter.test.ts`** - Tests covering:
   - Enrollment notificat
...(truncated)
