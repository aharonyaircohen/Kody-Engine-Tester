
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


### autofix (2026-04-07T20:54:36)
**Correction:** I've thoroughly investigated and there is **no drizzle query call in `tests/int/api.int.spec.ts`** that selects from `pg_constraint`. The file only contains a simple `payload.find()` call.

The error you referenced:
```sql
SELECT conname AS primary_key
FROM   pg_constraint join pg_class on (pg_class.oid = conrelid)
WHERE  contype = 'p' 
AND    connamespace = $1::regnamespace  
AND    pg_class.relname = $2;
```

This is **internal to Payload's postgres adapter** (`@payloadcms/db-p
...(truncated)
