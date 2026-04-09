
### taskify (2026-04-09T23:49:36)
Now I have enough context to classify this task.

{"task_type":"feature","title":"Add notification formatter service with templates","description":"Create `formatNotification(type: string, data: Record<string, string>): { subject: string; body: string }` in `src/services/notification-formatter.ts` with templates for 'enrollment', 'grade', and 'reminder' notification types. Include co-located tests following existing service test patterns.","scope":["src/services/notification-formatter.ts","src/s
...(truncated)

### build (2026-04-09T23:52:28)
Implementation complete. Created:

- `src/services/notification-formatter.ts` - with `formatNotification(type, data)` supporting `enrollment`, `grade`, and `reminder` templates
- `src/services/notification-formatter.test.ts` - 9 tests covering all templates and edge cases

All tests pass.

