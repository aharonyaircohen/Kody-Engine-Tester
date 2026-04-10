Based on the pattern discovery, I'll create a simple `add` utility following the existing conventions.

## Plan

**Step 1: Create test file for add utility**

**File:** `src/utils/add.test.ts`
**Change:** Create test file following `sum.test.ts` pattern
**Why:** TDD approach - tests before implementation
**Verify:** Run `pnpm test:int src/utils/add.test.ts`

```typescript
import { describe, expect, it } from 'vitest'

import add from './add'

describe('add', () => {
  it('adds two positive numbers', () => {
    expect(add(1, 2)).toBe(3)
  })

  it('adds negative numbers', () => {
    expect(add(-1, -2)).toBe(-3)
  })

  it('handles zero', () => {
    expect(add(0, 5)).toBe(5)
    expect(add(5, 0)).toBe(5)
  })
})
```

**Step 2: Create add utility**

**File:** `src/utils/add.ts`
**Change:** Create implementation following `sum.ts` pattern
**Why:** Simple two-number addition utility
**Verify:** Run `pnpm test:int src/utils/add.test.ts`

```typescript
export default function add(a: number, b: number): number {
  return a + b
}
```

## Existing Patterns Found

- **Utility pattern** (`src/utils/sum.ts`, `src/utils/clamp.ts`): Default export function, simple pure logic, co-located `.test.ts` file
- **Test pattern** (`src/utils/sum.test.ts`): Uses `describe`/`it` blocks with `expect` from vitest

## Verification

Run: `pnpm test:int src/utils/add.test.ts`
