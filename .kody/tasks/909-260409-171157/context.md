
### taskify (2026-04-09T17:14:30)
{
  "task_type": "feature",
  "title": "Add notification formatter service",
  "description": "Create `formatNotification(type: string, data: Record<string, string>): { subject: string; body: string }` in `src/services/notification-formatter.ts` with templates for 'enrollment', 'grade', and 'reminder' notification types. Include co-located tests.",
  "scope": [
    "src/services/notification-formatter.ts",
    "src/services/notification-formatter.test.ts"
  ],
  "risk_level": "low",
  "existing_
...(truncated)

### build (2026-04-09T17:16:42)
Implementation complete. Created:

- **`src/services/notification-formatter.ts`** - Service with `formatNotification(type, data)` supporting 'enrollment', 'grade', and 'reminder' templates
- **`src/services/notification-formatter.test.ts`** - 7 tests covering all templates and fallback behavior

All tests pass and code follows existing conventions.

