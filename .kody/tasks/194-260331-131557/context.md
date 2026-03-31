
### taskify (2026-03-31T13:20:56)
**Summary:** The `debounce` function already exists at `src/utils/debounce.ts` with:
- Full implementation with `leading`/`trailing` options
- 11 unit tests using fake timers in `src/utils/debounce.test.ts`
- All tests pass (12ms)

The task description appears to have mismatched Context/Verification sections (about kody-engine-lite review-fix loop) versus the actual Task (add debounce). Since the implementation already exists and works correctly, the task is effectively complete.


### plan (2026-03-31T13:21:33)
## Plan

### Step 1: Create `src/lib/` directory and `utils.ts`

**File:** `src/lib/utils.ts`
**Change:** Create new file with debounce function using the exact signature from the task: `<T extends (...args: unknown[]) => void>(fn: T, ms: number): T`
**Why:** The task specifies this exact location and type signature
**Verify:** `ls -la src/lib/` shows the file exists

### Step 2: Create unit test file

**File:** `src/lib/utils.test.ts`
**Change:** Create test file using fake timers (vi.useFakeTi
...(truncated)

### build (2026-03-31T13:25:26)
Implementation complete.

**Summary:**
- Created `src/lib/utils.ts` with `debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T`
- Created `src/lib/utils.test.ts` with 11 unit tests using fake timers (`vi.useFakeTimers()`)
- All tests pass (18ms)
- No TypeScript errors in the new files


### review (2026-03-31T13:28:44)
## Verdict: PASS

## Summary

Added `debounce` function to `src/lib/utils.ts` with 11 unit tests in `src/lib/utils.test.ts` using fake timers (`vi.useFakeTimers`). All 11 tests pass (17ms). The implementation matches the task-specified type signature `T extends (...args: unknown[]) => void`.

## Findings

### Critical

None.

### Major

None.

### Minor

None.

## Two-Pass Review

**Pass 1 — CRITICAL:**

### SQL & Data Safety
- No SQL operations. N/A.

### Race Conditions & Concurrency
- `clearT
...(truncated)

### review-fix (2026-03-31T13:29:41)
**Task complete.** The `debounce` function has been added to `src/lib/utils.ts` with 11 unit tests in `src/lib/utils.test.ts` using fake timers. All 1418 tests pass.

