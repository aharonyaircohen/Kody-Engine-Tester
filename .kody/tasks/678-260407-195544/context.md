
### taskify (2026-04-07T20:00:50)
```json
{
  "task_type": "feature",
  "title": "Add notification formatter service",
  "description": "Created `src/services/notification-formatter.ts` with `formatNotification(type: string, data: Record<string, string>): { subject: string; body: string }` function supporting 'enrollment', 'grade', and 'reminder' templates. Added comprehensive tests in `src/services/notification-formatter.test.ts` covering all three notification types with various field combinations, unknown type handling, edge 
...(truncated)

### build (2026-04-07T20:02:21)

All 19 tests pass. The notification formatter service and tests are already implemented:

**`src/services/notification-formatter.ts`** - Contains:
- `NotificationTemplate` interface with `subject` and `body` fields
- `formatNotification(type, data)` function supporting 3 notification types:
  - `enrollment` - enrollment confirmation with course/student names
  - `grade` - grade posting notification with assignment, course, grade, and maxGrade
  - `reminder` - task reminder with task name and du
...(truncated)
