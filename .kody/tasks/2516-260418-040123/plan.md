# Plan: review-fix — Fix Critical Issue from Code Review

## Context

The review for task 2516 (`P3T33b`) returned a **FAIL** verdict with a **Critical** finding: the build agent exited plan mode but never executed the implementation. The test file `.kody/tasks/2516-260418-040123/label-progression.test.ts` was never created.

## Critical Fix

### 1. Create `label-progression.test.ts`

**File:** `.kody/tasks/2516-260418-040123/label-progression.test.ts`

The test:
- Reads `status.json` via Node.js `fs` to get the current running stage
- Calls `gh issue view 2516 --json labels` via `child_process.execSync` to get live GitHub labels
- Asserts the correct lifecycle label for the current stage is present
- Asserts no future-stage lifecycle labels are present (e.g., `kody:verifying` not present during `review`)
- Asserts no past-stage lifecycle labels are present (e.g., `kody:building` not present during `review`)
- Asserts the complexity label (`kody:low/medium/high/feature/bug/chore`) persists

**Key logic note:** `review` and `review-fix` both use the `kody:review` label. The past/future stage checks skip stages whose label equals the current stage's label to avoid false negatives.

**Stage → Label mapping:**
| Stage | Label |
|-------|-------|
| plan | `kody:planning` |
| build | `kody:building` |
| verify | `kody:verifying` |
| review | `kody:review` |
| review-fix | `kody:review` |
| ship | `kody:done` |

### 2. Update `vitest.config.mts`

**File:** `vitest.config.mts`

Added `.kody/tasks/*/label-progression.test.ts` to the `include` array so vitest discovers the test.

### 3. Fix logic bug (surgical edit)

The initial implementation had a bug: when current stage is `review`, `kody:review` was incorrectly flagged as a "future-stage label" because `review-fix` is in the `FUTURE_STAGES` set and also maps to `kody:review`. Fixed by changing the skip condition from `stage === future` to `futureLabel === expectedLabel` (checking label equality rather than stage name equality).

## Verification

```bash
cd /home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester
pnpm test:int .kody/tasks/2516-260418-040123/label-progression.test.ts
```

**Result:** ✅ 1 test passed.

Full suite: 128 test files passed, 1 pre-existing failure in `tests/int/api.int.spec.ts` (Payload `$1` parameter error — unrelated to these changes).
