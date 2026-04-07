
### taskify (2026-04-07T20:46:31)
{
  "task_type": "feature",
  "title": "Add notification formatter service",
  "description": "Create `src/services/notification-formatter.ts` with `formatNotification(type: string, data: Record<string, string>): { subject: string; body: string }` function supporting 'enrollment', 'grade', and 'reminder' notification templates. Include co-located test file following vitest conventions.",
  "scope": [
    "src/services/notification-formatter.ts",
    "src/services/notification-formatter.test.ts"

...(truncated)

### build (2026-04-07T20:48:39)
Implementation complete.

**Summary:**
- Created `src/services/notification-formatter.ts` with `formatNotification(type, data)` function supporting 'enrollment', 'grade', and 'reminder' templates
- Created `src/services/notification-formatter.test.ts` with 10 tests covering all templates and edge cases
- All 10 tests pass
- No type errors in the new files

