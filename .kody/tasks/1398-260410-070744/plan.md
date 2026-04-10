## Existing Patterns Found

- **`src/utils/logger/index.ts:58-64`** — `createFileTransport` uses `fs.appendFileSync` for line-based file append; same pattern to reuse
- **`src/services/grading.test.ts`** — vitest test structure with `describe/it/expect`, in-memory Map stores for mock data
- **`src/services/grading.ts`** — named export pattern for services in `src/services/`

## Plan

**Step 1: Create `src/services/audit-logger.test.ts`**

**File:** `src/services/audit-logger.test.ts`
**Change:** Write tests that:
- Use a temp file path for the audit log
- Call `logAuditEvent` with various event shapes
- Verify the file contains valid JSONL (one JSON object per line) with correct fields including ISO timestamp
- Verify `details` is optional — event without `details` still writes valid JSONL
- Verify multiple events are appendable (not overwritten)

**Verify:** `pnpm test:int src/services/audit-logger.test.ts`

---

**Step 2: Create `src/services/audit-logger.ts`**

**File:** `src/services/audit-logger.ts`
**Change:** Implement:
```typescript
export interface AuditEvent {
  action: string
  userId: string
  resource: string
  details?: string
}

export function logAuditEvent(event: AuditEvent): void {
  // Use fs.appendFileSync to append a JSON line to the audit log file
  // Default file path: logs/audit.jsonl
  // Include ISO timestamp in each line
}
```

**Verify:** `pnpm test:int src/services/audit-logger.test.ts` passes

---

**Step 3: Verify all tests still pass**

**Command:** `pnpm test:int`
**Why:** Confirm no regressions across the test suite
