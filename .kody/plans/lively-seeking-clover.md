# Plan: hotfix-2418-260417-234714 — P1T37 Hotfix Fast-Track Pipeline

## Context
This is a **hotfix pipeline test task** (`@kody hotfix`). The task has two objectives:
1. **Code fix**: "Fix the missing default export in src/utils/helpers.ts"
2. **Pipeline verification**: Confirm the hotfix pipeline runs only build→verify→ship (skipping taskify/plan/review) and that verify skips tests

The pipeline is currently in the `build` stage (status: running). The previous hotfix run (hotfix-1949) produced a verify.md showing a FAIL result.

---

## Step 1: Verify the code fix

**File**: `src/utils/helpers.ts`

The file already contains `export default helpers` at line 51. This appears to be already fixed.
- Named exports exist: `isDefined`, `isString`, `isNumber`, `toString`, `toNumber`
- Default export: `export default helpers` (object containing all named exports)

**Action**: Confirm by running `pnpm tsc --noEmit` to check for any remaining TypeScript errors in helpers.ts specifically.

---

## Step 2: Run the build stage

**Action**: Execute `pnpm build` to run the Next.js build.

This is what the `build` stage does. The pipeline's `build` stage already started.

---

## Step 3: Run the verify stage (skipping tests)

**Action**: Run verify commands individually, skipping `pnpm test`:
1. `pnpm tsc --noEmit` — typecheck
2. `pnpm lint` — lint

**Critical verification**: Confirm `pnpm test` is NOT run during verify in hotfix mode. The `kody.config.json` quality section defines `testUnit: "pnpm test"` — this should be omitted in hotfix verify.

---

## Step 4: Document pipeline discrepancy

The status.json shows all stages including taskify and plan as completed, which contradicts the hotfix requirement (build→verify→ship only).

**Action**: Write a `verify.md` in the task directory noting:
- Whether tests were skipped during verify
- Whether the build passed
- Any pipeline stage discrepancies

---

## Critical Files
- `src/utils/helpers.ts` — code to fix (already has default export)
- `kody.config.json` — defines quality commands for verify stage
- `.kody/tasks/hotfix-2418-260417-234714/status.json` — current pipeline state
- `.kody/tasks/hotfix-2418-260417-234714/verify.md` — output verification report

---

## Verification
1. `pnpm tsc --noEmit` exits with 0 (no type errors)
2. `pnpm lint` exits with 0 (no errors, warnings acceptable)
3. `pnpm test` was NOT executed during verify stage
4. `verify.md` created with results
