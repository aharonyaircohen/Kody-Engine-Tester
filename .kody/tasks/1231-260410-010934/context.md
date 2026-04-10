
### taskify (2026-04-10T01:12:10)
{
  "task_type": "feature",
  "title": "Add notification formatter service",
  "description": "Create formatNotification(type: string, data: Record<string, string>): { subject: string; body: string } in src/services/notification-formatter.ts with templates for 'enrollment', 'grade', 'reminder' notification types. Include co-located tests.",
  "scope": ["src/services/notification-formatter.ts", "src/services/notification-formatter.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "sr
...(truncated)

### build (2026-04-10T01:14:59)
Implementation complete. I've created:

**`src/services/notification-formatter.ts`** - A notification formatter service with:
- `formatNotification(type: string, data: Record<string, string>): { subject: string; body: string }` function
- Templates for `'enrollment'`, `'grade'`, and `'reminder'` notification types
- Template interpolation using `{{placeholder}}` syntax
- Graceful fallback for unknown notification types

**`src/services/notification-formatter.test.ts`** - 9 tests covering:
- All 
...(truncated)
