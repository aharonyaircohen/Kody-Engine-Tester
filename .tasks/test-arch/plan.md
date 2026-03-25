Here is the implementation plan:

---

## Step 1: Create the test file (RED phase)
**File:** `src/utils/pick.test.ts`
**Change:** Create with complete test suite covering all edge cases
**Why:** TDD — tests first
**Verify:** `pnpm test src/utils/pick.test.ts` — tests should FAIL (pick.ts doesn't exist yet)

```ts
import { describe, it, expect } from 'vitest'
import { pick } from './pick'

describe('pick', () => {
  it('should return a new object with only the specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 }
    expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 })
  })

  it('should return an empty object when keys array is empty', () => {
    expect(pick({ a: 1, b: 2 }, [])).toEqual({})
  })

  it('should ignore keys that do not exist on the object', () => {
    const obj = { a: 1, b: 2 }
    expect(pick(obj, ['a', 'z' as keyof typeof obj])).toEqual({ a: 1 })
  })

  it('should not mutate the original object', () => {
    const obj = { a: 1, b: 2, c: 3 }
    pick(obj, ['a'])
    expect(obj).toEqual({ a: 1, b: 2, c: 3 })
  })

  it('should handle all keys present', () => {
    const obj = { x: 10, y: 20 }
    expect(pick(obj, ['x', 'y'])).toEqual({ x: 10, y: 20 })
  })

  it('should handle object with various value types', () => {
    const obj = { a: 'hello', b: 42, c: true, d: null }
    expect(pick(obj, ['a', 'c'])).toEqual({ a: 'hello', c: true })
  })

  it('should return a new object reference, not the original', () => {
    const obj = { a: 1 }
    expect(pick(obj, ['a'])).not.toBe(obj)
  })
})
```

---

## Step 2: Create the implementation file (GREEN phase)
**File:** `src/utils/pick.ts`
**Change:** Implement `pick` with TypeScript generics
**Why:** Minimal implementation to make all tests pass
**Verify:** `pnpm test src/utils/pick.test.ts` — all tests should PASS

```ts
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
    return result
  }, {} as Pick<T, K>)
}
```

---

## Step 3: Run the full test suite to confirm no regressions
**File:** N/A
**Change:** No changes — verification only
**Why:** Confirm `pick` tests pass and existing utils are unaffected
**Verify:** `pnpm test` — all tests across `src/utils/` should pass
