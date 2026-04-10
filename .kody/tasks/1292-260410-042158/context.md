
### taskify (2026-04-10T04:24:35)
{
  "task_type": "feature",
  "title": "Add notification formatter service",
  "description": "Create `formatNotification(type: string, data: Record<string, string>): { subject: string; body: string }` in `src/services/notification-formatter.ts` with templates for 'enrollment', 'grade', and 'reminder' notification types, with co-located tests",
  "scope": [
    "src/services/notification-formatter.ts",
    "src/services/notification-formatter.test.ts"
  ],
  "risk_level": "low",
  "existing_patt
...(truncated)

### build (2026-04-10T04:27:41)
Implementation complete. Here's a summary:

**Created files:**
- `src/services/notification-formatter.ts` - Notification formatter with templates for `enrollment`, `grade`, and `reminder` types
- `src/services/notification-formatter.test.ts` - 7 tests covering all template types and error handling

**Function signature:**
```typescript
formatNotification(type: 'enrollment' | 'grade' | 'reminder', data: TemplateData): { subject: string; body: string }
```

**Test results:** All 7 tests pass with 
...(truncated)
