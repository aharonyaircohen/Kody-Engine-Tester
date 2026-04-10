## Existing Patterns Found

- `src/utils/logger/index.ts`: `fileTransport` uses `fs.appendFileSync` to append lines to a file — audit logger will reuse the same synchronous file-append pattern.
- `src/services/*.ts` services follow a simple class/function pattern with typed interfaces.
- Test files are co-located (`*.test.ts`) alongside source in `src/services/`.

## Plan

**Step 1: Create `src/services/audit-logger.ts` with tests first (TDD)**

**File:** `src/services/audit-logger.test.ts`
**Change:** Write tests for `logAuditEvent`:
- Appends a JSON line to `logs/audit.jsonl`
- Each line contains `timestamp` (ISO), `action`, `userId`, `resource`, `details`
- `details` is optional — omit from line if not provided
- File is created if it doesn't exist
- Multiple calls produce valid JSONL (one JSON object per line)

**File:** `src/services/audit-logger.ts`
**Change:** Implement `logAuditEvent`:
```typescript
import * as fs from 'fs'
import * as path from 'path'

const AUDIT_LOG_PATH = path.join(process.cwd(), 'logs', 'audit.jsonl')

export interface AuditEvent {
  action: string
  userId: string
  resource: string
  details?: string
}

export function logAuditEvent(event: AuditEvent): void {
  const line: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    action: event.action,
    userId: event.userId,
    resource: event.resource,
  }
  if (event.details !== undefined) {
    line.details = event.details
  }
  const dir = path.dirname(AUDIT_LOG_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.appendFileSync(AUDIT_LOG_PATH, JSON.stringify(line) + '\n')
}
```

**Verify:** `pnpm test:int -- src/services/audit-logger.test.ts`

---

**Step 2: Verify full test suite passes**

**Verify:** `pnpm test:int`
