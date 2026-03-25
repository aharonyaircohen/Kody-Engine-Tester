## Implementation Plan

## Step 1: Create the test file
**File:** `src/utils/debounce.test.ts`
**Change:** Create a comprehensive test suite using `vi.useFakeTimers()` to verify debounce behavior.
**Why:** TDD — tests first. Fake timers let us control time without actual delays.
**Verify:** Run `pnpm test src/utils/debounce.test.ts` — tests should FAIL (RED phase, no implementation yet).

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce } from './debounce'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should not call the function immediately', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()

    expect(fn).not.toHaveBeenCalled()
  })

  it('should call the function after the delay', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    vi.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should not call the function before the delay has elapsed', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    vi.advanceTimersByTime(299)

    expect(fn).not.toHaveBeenCalled()
  })

  it('should reset the timer on subsequent calls', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    vi.advanceTimersByTime(200)
    debounced()
    vi.advanceTimersByTime(200)

    expect(fn).not.toHaveBeenCalled()
  })

  it('should call only once after multiple rapid calls', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    debounced()
    debounced()
    vi.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should pass the latest arguments to the function', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced('first')
    debounced('second')
    debounced('third')
    vi.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledWith('third')
  })

  it('should allow multiple calls after delay has elapsed between them', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    vi.advanceTimersByTime(300)
    debounced()
    vi.advanceTimersByTime(300)

    expect(fn).toHaveBeenCalledTimes(2)
  })
})
```

---

## Step 2: Implement the debounce function
**File:** `src/utils/debounce.ts`
**Change:** Create the minimal implementation that passes all tests.
**Why:** GREEN phase — implement just enough to satisfy the test suite.
**Verify:** Run `pnpm test src/utils/debounce.test.ts` — all 7 tests should PASS.

```typescript
export function debounce<T extends unknown[]>(
  fn: (...args: T) => void,
  delay: number
): (...args: T) => void {
  let timer: ReturnType<typeof setTimeout> | undefined

  return (...args: T) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
```

---

**Summary of files to create:**
- `src/utils/debounce.test.ts` — 7 tests covering: no immediate call, fires after delay, resets on rapid calls, passes latest args, multiple separate calls
- `src/utils/debounce.ts` — generic debounce using `clearTimeout`/`setTimeout`

No config changes needed — `vitest.config.mts` already includes `src/**/*.test.ts`.
