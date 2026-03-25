## Implementation Plan: `isEmpty` Utility

## Step 1: Create the test file (RED phase)
**File:** `src/utils/is-empty.test.ts`
**Change:** Create the test file with comprehensive cases covering all empty value types
**Why:** TDD — tests first before any implementation exists
**Verify:** Run `pnpm test src/utils/is-empty.test.ts` — all tests should FAIL

```typescript
import { describe, it, expect } from 'vitest'
import { isEmpty } from './is-empty'

describe('isEmpty', () => {
  it('should return true for null', () => {
    expect(isEmpty(null)).toBe(true)
  })

  it('should return true for undefined', () => {
    expect(isEmpty(undefined)).toBe(true)
  })

  it('should return true for empty string', () => {
    expect(isEmpty('')).toBe(true)
  })

  it('should return true for empty array', () => {
    expect(isEmpty([])).toBe(true)
  })

  it('should return true for empty object', () => {
    expect(isEmpty({})).toBe(true)
  })

  it('should return false for non-empty string', () => {
    expect(isEmpty('hello')).toBe(false)
  })

  it('should return false for non-empty array', () => {
    expect(isEmpty([1, 2, 3])).toBe(false)
  })

  it('should return false for non-empty object', () => {
    expect(isEmpty({ key: 'value' })).toBe(false)
  })

  it('should return false for numbers (zero and non-zero)', () => {
    expect(isEmpty(0)).toBe(false)
    expect(isEmpty(42)).toBe(false)
  })

  it('should return false for boolean false', () => {
    expect(isEmpty(false)).toBe(false)
  })
})
```

---

## Step 2: Implement the function (GREEN phase)
**File:** `src/utils/is-empty.ts`
**Change:** Create the implementation that makes all tests pass
**Why:** Minimal implementation to satisfy the test cases
**Verify:** Run `pnpm test src/utils/is-empty.test.ts` — all 10 tests should PASS

```typescript
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value as object).length === 0
  return false
}
```

---

**Summary of cases handled:**
| Input | Result |
|-------|--------|
| `null` | `true` |
| `undefined` | `true` |
| `''` | `true` |
| `[]` | `true` |
| `{}` | `true` |
| `'hello'`, `[1]`, `{a:1}` | `false` |
| `0`, `false`, `42` | `false` |

The `typeof value === 'object'` check is placed after the `null` guard (since `typeof null === 'object'` in JS) and after `Array.isArray` so plain objects are handled last. Non-object primitives like numbers and booleans fall through to `return false`.
