# Plan: review-fix — Fix Major Issue from Code Review

## Context

The second review returned FAIL with a **Major** finding: `review-fix` is listed in `PAST_STAGES` but its stage state in `status.json` is `"pending"` — it hasn't executed yet, so its label was never set. The pipeline should only assert that labels for stages that have **actually completed** should have been removed.

Note: The **Critical** finding from the second review (PAST_STAGES skip logic using `past === stage` instead of `pastLabel === expectedLabel`) was **already fixed** by the previous review-fix agent. The current `label-progression.test.ts` already has `if (pastLabel === expectedLabel) continue` at line 109, and the test passes cleanly. Only the **Major** issue remains.

## Files to Modify

### `.kody/tasks/2516-260418-040123/label-progression.test.ts`

**Change:** Remove `'review-fix'` from `PAST_STAGES` (line 22).

**Why:** `review-fix` is `"state": "pending"` in `status.json` — it has not run yet, so `kody:review` was never set by it. Including it in `PAST_STAGES` asserts its label "should have been removed" before `review` ran, which is a false premise. At the `review` stage, `review-fix` is actually a **future** stage, not past.

**After fix, PAST_STAGES will be:**
```typescript
const PAST_STAGES = new Set(['plan', 'build', 'verify'])  // 'review-fix' removed
```

**Verification:** This is safe for all stages:
- At `review` (current): only checks `plan`/`build`/`verify` — all genuinely past ✓
- At `ship`: `plan`/`build`/`verify` all correctly absent ✓
- At `review-fix`: `plan`/`build`/`verify`/`review` all correctly absent ✓

**Note:** `review-fix` is kept in `FUTURE_STAGES`, which is correct — from `review`, `review-fix` is the next stage. The shared-label skip `if (futureLabel === expectedLabel) continue` (line 101) already prevents false failures there.

## Verification

```bash
# Run the label-progression test in isolation
pnpm vitest run ".kody/tasks/2516-260418-040123/label-progression.test.ts"

# Run full integration suite (excluding pre-existing Payload DB failure)
pnpm test:int -- --run
```

Expected: test passes, all 128+ test files pass (pre-existing `tests/int/api.int.spec.ts` failure is unrelated to this task).
