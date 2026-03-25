Based on the project structure (Vitest config includes `src/**/*.test.ts`, jsdom environment), here is the implementation plan:

---

## Step 1: Write the test file (RED phase)
**File:** `src/utils/truncate.test.ts`
**Change:** Create test suite with cases for: string under limit (no change), string at exact limit (no change), string over limit (truncated with `...`), edge cases (maxLength 0, empty string, maxLength shorter than `...`)
**Why:** TDD requires tests first; defines the contract before implementation

## Step 2: Verify tests fail
**File:** Terminal
**Change:** Run `pnpm test` and confirm tests fail with "Cannot find module" or similar
**Why:** Confirms we are in RED phase — tests exist but implementation does not

## Step 3: Implement the utility function (GREEN phase)
**File:** `src/utils/truncate.ts`
**Change:** Export a `truncate(str: string, maxLength: number): string` function that returns `str` unchanged if `str.length <= maxLength`, otherwise returns `str.slice(0, maxLength) + '...'`
**Why:** Minimal implementation to satisfy the test cases

## Step 4: Verify tests pass
**File:** Terminal
**Change:** Run `pnpm test` and confirm all truncate tests pass
**Why:** Confirms GREEN phase — implementation satisfies all defined test cases
