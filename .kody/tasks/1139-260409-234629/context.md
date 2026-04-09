
### taskify (2026-04-09T23:48:49)
```json
{
  "task_type": "feature",
  "title": "Add audit logger service",
  "description": "Create `logAuditEvent(event: { action: string; userId: string; resource: string; details?: string }): void` in `src/services/audit-logger.ts` that appends a JSON line to a JSONL file. Include co-located tests in `src/services/audit-logger.test.ts`.",
  "scope": ["src/services/audit-logger.ts", "src/services/audit-logger.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/logger/inde
...(truncated)

### build (2026-04-09T23:51:16)
Implementation complete. Summary:

**Created `src/services/audit-logger.ts`:**
- `logAuditEvent(event: { action: string; userId: string; resource: string; details?: string }): void` - appends a JSON line to `logs/audit.jsonl`
- `configureAuditLogger(options: AuditLogOptions)` - allows configuring custom file path
- `resetAuditLoggerConfig()` - resets to default path
- Ensures `logs/` directory exists before appending (matches existing `createFileTransport` pattern using `fs.appendFileSync`)

**C
...(truncated)
