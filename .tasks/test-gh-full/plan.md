Here is the implementation plan:

## Step 1: Create the test file (RED phase)
**File:** `src/utils/group-by.test.ts`
**Change:** Create with the following content:
```typescript
import { describe, it, expect } from 'vitest'
import { groupBy } from './group-by'

describe('groupBy', () => {
  it('should group items by string key function', () => {
    const items = ['one', 'two', 'three', 'four']
    expect(groupBy(items, (s) => String(s.length))).toEqual({
      '3': ['one', 'two'],
      '4': ['four'],
      '5': ['three'],
    })
  })

  it('should group objects by a property key function', () => {
    const items = [
      { type: 'a', val: 1 },
      { type: 'b', val: 2 },
      { type: 'a', val: 3 },
    ]
    expect(groupBy(items, (x) => x.type)).toEqual({
      a: [{ type: 'a', val: 1 }, { type: 'a', val: 3 }],
      b: [{ type: 'b', val: 2 }],
    })
  })

  it('should return an empty object for an empty array', () => {
    expect(groupBy([], (x) => String(x))).toEqual({})
  })

  it('should handle all items falling into a single group', () => {
    expect(groupBy([1, 2, 3], () => 'same')).toEqual({ same: [1, 2, 3] })
  })

  it('should handle each item in its own group', () => {
    expect(groupBy([1, 2, 3], (x) => String(x))).toEqual({
      '1': [1],
      '2': [2],
      '3': [3],
    })
  })

  it('should not mutate the original array', () => {
    const items = [1, 2, 3]
    groupBy(items, (x) => String(x))
    expect(items).toEqual([1, 2, 3])
  })

  it('should handle numeric keys returned as strings', () => {
    const items = [10, 20, 11, 21]
    expect(groupBy(items, (x) => String(Math.floor(x / 10)))).toEqual({
      '1': [10, 11],
      '2': [20, 21],
    })
  })

  it('should return a new object reference each call', () => {
    const items = [1]
    const r1 = groupBy(items, (x) => String(x))
    const r2 = groupBy(items, (x) => String(x))
    expect(r1).not.toBe(r2)
  })
})
```
**Why:** TDD — tests first so we confirm RED before implementing.
**Verify:** `pnpm test src/utils/group-by.test.ts` — should fail with "Cannot find module './group-by'".

---

## Step 2: Implement the utility (GREEN phase)
**File:** `src/utils/group-by.ts`
**Change:** Create with the following content:
```typescript
export function groupBy<T>(
  items: readonly T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  const result: Record<string, T[]> = {}
  for (const item of items) {
    const key = keyFn(item)
    if (key in result) {
      result[key].push(item)
    } else {
      result[key] = [item]
    }
  }
  return result
}
```
**Why:** Iterates once (O(n)), builds the result object additively, accepts `readonly` arrays for ergonomics.
**Verify:** `pnpm test src/utils/group-by.test.ts` — all 8 tests should pass.
