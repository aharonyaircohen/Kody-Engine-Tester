
### taskify (2026-04-09T17:14:46)
{
  "task_type": "feature",
  "title": "Add audit logger service with JSONL file append",
  "description": "Create `src/services/audit-logger.ts` with `logAuditEvent(event: { action: string; userId: string; resource: string; details?: string }): void` that appends timestamped JSON lines to an audit log file. Include co-located tests in `src/services/audit-logger.test.ts`.",
  "scope": ["src/services/audit-logger.ts", "src/services/audit-logger.test.ts"],
  "risk_level": "low",
  "existing_patter
...(truncated)

### build (2026-04-09T17:17:37)
Implementation complete. Here's a summary:

**Created files:**

1. `src/services/audit-logger.ts` - Audit logger service with:
   - `AuditEvent` interface: `{ action, userId, resource, details? }`
   - `AuditLogEntry` interface: extends `AuditEvent` with ISO `timestamp`
   - `logAuditEvent(event, logPath?)` function that appends JSONL to file
   - Uses `fs.appendFileSync` (same pattern as existing logger)
   - Supports `AUDIT_LOG_PATH` env var or custom path parameter

2. `src/services/audit-log
...(truncated)
