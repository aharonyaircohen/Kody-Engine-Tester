Now I have the full picture. Here's the implementation plan:

---

## Step 1: Update vitest config to discover unit tests
**File:** `vitest.config.mts`
**Change:** Add `src/**/*.test.ts` to the `include` array so unit tests are discovered alongside integration tests.
**Why:** The current config only picks up `tests/int/**/*.int.spec.ts`. Unit tests in `src/utils/` won't run without this change.
**Verify:** `pnpm run test:int` (should still pass — no unit tests exist yet, so it's a no-op addition)

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts', 'src/**/*.test.ts'],
  },
})
```

---

## Step 2: Write the test file (RED phase)
**File:** `src/utils/group-by.test.ts`
**Change:** Create the test suite. Import `groupBy` from `./group-by` (which doesn't exist yet — this makes tests fail).
**Why:** TDD requires tests first. The import error confirms RED phase.
**Verify:** `pnpm run test:int` — expect failure: `Cannot find module './group-by'`

```ts
import { describe, it, expect } from 'vitest'
import { groupBy } from './group-by'

describe('groupBy', () => {
  it('groups strings by length', () => {
    const result = groupBy(['one', 'two', 'three', 'four'], (s) => String(s.length))
    expect(result).toEqual({
      '3': ['one', 'two'],
      '5': ['three'],
      '4': ['four'],
    })
  })

  it('groups objects by a property', () => {
    const items = [
      { name: 'Alice', dept: 'eng' },
      { name: 'Bob', dept: 'sales' },
      { name: 'Carol', dept: 'eng' },
    ]
    const result = groupBy(items, (item) => item.dept)
    expect(result).toEqual({
      eng: [{ name: 'Alice', dept: 'eng' }, { name: 'Carol', dept: 'eng' }],
      sales: [{ name: 'Bob', dept: 'sales' }],
    })
  })

  it('returns empty object for empty array', () => {
    expect(groupBy([], (x) => String(x))).toEqual({})
  })

  it('puts all items in one group when key function returns same value', () => {
    const result = groupBy([1, 2, 3], () => 'all')
    expect(result).toEqual({ all: [1, 2, 3] })
  })

  it('creates a separate group for each unique item', () => {
    const result = groupBy([1, 2, 3], (n) => String(n))
    expect(result).toEqual({ '1': [1], '2': [2], '3': [3] })
  })

  it('does not mutate the original array', () => {
    const arr = [1, 2, 3]
    groupBy(arr, (n) => String(n))
    expect(arr).toEqual([1, 2, 3])
  })

  it('converts numeric keys to strings', () => {
    const result = groupBy([10, 20, 10], (n) => String(n))
    expect(result['10']).toEqual([10, 10])
    expect(result['20']).toEqual([20])
  })

  it('preserves insertion order within groups', () => {
    const result = groupBy(['b', 'a', 'b', 'c', 'a'], (s) => s)
    expect(result['b']).toEqual(['b', 'b'])
    expect(result['a']).toEqual(['a', 'a'])
    expect(result['c']).toEqual(['c'])
  })
})
```

---

## Step 3: Implement the function (GREEN phase)
**File:** `src/utils/group-by.ts`
**Change:** Create the implementation that satisfies all tests.
**Why:** Minimal implementation to turn RED → GREEN.
**Verify:** `pnpm run test:int` — all 8 tests should pass

```ts
export function groupBy<T>(items: readonly T[], keyFn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {}
  for (const item of items) {
    const key = keyFn(item)
    if (!result[key]) {
      result[key] = []
    }
    result[key].push(item)
  }
  return result
}
```

---

**Summary of changes:**
| File | Action |
|------|--------|
| `vitest.config.mts` | Add `src/**/*.test.ts` to `include` |
| `src/utils/group-by.test.ts` | Create (8 test cases) |
| `src/utils/group-by.ts` | Create (14-line implementation) |
