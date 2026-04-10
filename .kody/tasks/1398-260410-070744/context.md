
### taskify (2026-04-10T07:11:03)
```json
{
  "task_type": "feature",
  "title": "Add audit logger service with JSONL file append",
  "description": "Create `src/services/audit-logger.ts` with `logAuditEvent(event: { action: string; userId: string; resource: string; details?: string }): void` that appends audit events as JSON Lines to a file. Include co-located `audit-logger.test.ts` with vitest tests covering basic append, optional details field, and file content verification.",
  "scope": [
    "src/services/audit-logger.ts",

...(truncated)

### plan (2026-04-10T07:11:44)
## Existing Patterns Found

- **`src/utils/logger/index.ts:58-64`** — `createFileTransport` uses `fs.appendFileSync` for line-based file append; same pattern to reuse
- **`src/services/grading.test.ts`** — vitest test structure with `describe/it/expect`, in-memory Map stores for mock data
- **`src/services/grading.ts`** — named export pattern for services in `src/services/`

## Plan

**Step 1: Create `src/services/audit-logger.test.ts`**

**File:** `src/services/audit-logger.test.ts`
**Change:**
...(truncated)

### build (2026-04-10T07:14:18)
All TypeScript errors are pre-existing in the codebase — none are related to my changes. The implementation is complete.

**Summary:**

- **`src/services/audit-logger.ts`** — exports `AuditEvent` interface and `logAuditEvent(event, logPath?)` function that appends a JSON line with ISO timestamp to the specified file (defaults to `logs/audit.jsonl`)
- **`src/services/audit-logger.test.ts`** — 4 tests covering: required fields + timestamp, optional `details` field inclusion, `details` omission whe
...(truncated)
