## Implementation Plan

### Step 1: Write the test file first (TDD)

**File:** `src/services/audit-logger.test.ts`
**Change:** Create comprehensive tests for `logAuditEvent` covering:
- Basic event logging (action, userId, resource, details)
- JSONL line format correctness (one JSON object per line)
- File path configurable via constructor
- Timestamp auto-appended
- Optional details field
- Error handling when file is not writable
- Multiple sequential events produce valid JSONL

**Why:** Follows TDD ordering; tests define the expected API behavior.

**Verify:** `pnpm test:int src/services/audit-logger.test.ts`

---

### Step 2: Implement the audit logger service

**File:** `src/services/audit-logger.ts`
**Change:** Create `AuditLogger` class with:
- `constructor(filePath?: string)` — defaults to a sensible path
- `logAuditEvent(event: { action: string; userId: string; resource: string; details?: string }): void` — appends a JSONL line
- Uses `require('fs')` pattern from `src/utils/logger/index.ts:58-64` to avoid top-level Node imports
- Each entry gets auto-appended `timestamp: new Date().toISOString()`
- Uses `fs.appendFileSync` to append one line per event

**Why:** Follows the established `fileTransport` pattern already proven in the codebase.

**Verify:** `pnpm test:int src/services/audit-logger.test.ts`

---

## Existing Patterns Found

- **`src/utils/logger/index.ts:58-64`** — `createFileTransport` uses `require('fs')` pattern with `fs.appendFileSync` for file-based log transport; reused for audit logger file I/O
- **`src/services/notifications.test.ts`** — vitest testing pattern with `beforeEach` setup of mock Payload; reused for test structure
- **Service constructor pattern** — services in `src/services/` accept dependencies via constructor; audit logger is intentionally simple (no deps)

---

## Questions

None — the task is clear and the approach is straightforward.
