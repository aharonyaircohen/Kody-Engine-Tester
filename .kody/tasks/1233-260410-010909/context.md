
### taskify (2026-04-10T01:17:56)
{
  "task_type": "feature",
  "title": "Add audit logger with JSONL persistence",
  "description": "Create `logAuditEvent(event: { action: string; userId: string; resource: string; details?: string }): void` in `src/services/audit-logger.ts` that appends audit events to a JSONL file. The function should be synchronous and append one JSON line per call. Include co-located tests at `src/services/audit-logger.test.ts`.",
  "scope": [
    "src/services/audit-logger.ts",
    "src/services/audit-logge
...(truncated)

### plan (2026-04-10T01:18:18)
## Existing Patterns Found

- `src/utils/logger/index.ts`: `fileTransport` uses `fs.appendFileSync` to append lines to a file — audit logger will reuse the same synchronous file-append pattern.
- `src/services/*.ts` services follow a simple class/function pattern with typed interfaces.
- Test files are co-located (`*.test.ts`) alongside source in `src/services/`.

## Plan

**Step 1: Create `src/services/audit-logger.ts` with tests first (TDD)**

**File:** `src/services/audit-logger.test.ts`
**Ch
...(truncated)

### build (2026-04-10T01:21:03)
**Implementation complete.** 

Created two files:

- **`src/services/audit-logger.ts`** — exports `logAuditEvent(event: AuditEvent)` which appends a JSON line to `logs/audit.jsonl` with `timestamp` (ISO), `action`, `userId`, `resource`, and optional `details`. Creates the `logs/` directory if it doesn't exist.

- **`src/services/audit-logger.test.ts`** — 8 tests covering: basic append, field validation, optional details omission, file/directory auto-creation, multiple calls producing valid JSONL
...(truncated)
