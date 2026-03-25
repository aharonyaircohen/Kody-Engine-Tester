Here's the implementation plan:

---

## Step 1: Create the test file
**File:** `src/utils/format-date.test.ts`
**Change:** Create with the following content:
```typescript
import { describe, it, expect } from 'vitest'
import { formatDate } from './format-date'

describe('formatDate', () => {
  it('should format a date in YYYY-MM-DD format', () => {
    expect(formatDate(new Date('2025-03-25'))).toBe('2025-03-25')
  })

  it('should zero-pad single-digit months', () => {
    expect(formatDate(new Date('2025-01-05'))).toBe('2025-01-05')
  })

  it('should zero-pad single-digit days', () => {
    expect(formatDate(new Date('2025-12-01'))).toBe('2025-12-01')
  })

  it('should handle year 2000', () => {
    expect(formatDate(new Date('2000-02-29'))).toBe('2000-02-29')
  })

  it('should handle end of year', () => {
    expect(formatDate(new Date('2024-12-31'))).toBe('2024-12-31')
  })
})
```
**Why:** TDD — write tests first (RED phase).
**Verify:** `pnpm test src/utils/format-date.test.ts` — should fail with module not found.

---

## Step 2: Create the implementation file
**File:** `src/utils/format-date.ts`
**Change:** Create with the following content:
```typescript
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}
```
**Why:** `toISOString()` returns `YYYY-MM-DDTHH:mm:ss.sssZ`; slicing to index 10 gives `YYYY-MM-DD` with zero-padding built in.
**Verify:** `pnpm test src/utils/format-date.test.ts` — all 5 tests should pass (GREEN phase).
