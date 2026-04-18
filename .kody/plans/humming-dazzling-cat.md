# Plan: hotfix-2589-260418-091447 — Verify Hotfix Pipeline

## Context

This is a **P1 hotfix task** (`@kody hotfix`) for Kody Engine pipeline verification. The task has two goals:
1. Verify the hotfix pipeline mode correctly skips `taskify/plan/review/review-fix` stages
2. Fix the "missing default export" in `src/utils/helpers.ts`

The task is being executed by a build agent currently running the `build` stage. The pipeline status shows `build=running`, `verify/ship=pending`, `taskify/plan/review/review-fix=completed` (carried over from a prior full run).

---

## What the Hotfix Pipeline Does (per engine source)

The Kody Engine (`@kody-ade/engine` v0.4.3) handles `hotfix` mode in `cli.js`:

- `complexity = "hotfix"` → `COMPLEXITY_SKIP["hotfix"] = ["taskify", "plan", "review", "review-fix"]`
  → **Only `build`, `verify`, `ship` stages run**
- `skipTests: isHotfix = true` → test command is **NOT** pushed to the verify stage quality gates

The verify stage in hotfix mode runs only:
```javascript
commands = [{ name: "typecheck", cmd: "pnpm tsc --noEmit" }]
// NO test command pushed (skipped because skipTests=true)
```

---

## Step 1: Verify `src/utils/helpers.ts` has the default export

**File**: `src/utils/helpers.ts`

The current file (confirmed from `git show HEAD:src/utils/helpers.ts`) contains:
```typescript
export function isDefined<T>(value: T | null | undefined): value is T { ... }
export function isString(value: unknown): value is string { ... }
export function isNumber(value: unknown): value is number { ... }
export function toString(value: unknown): string { ... }
export function toNumber(value: unknown, fallback: number = 0): number { ... }

const helpers = { isDefined, isString, isNumber, toString, toNumber }
export default helpers
```

**Status**: ✅ The default export already exists in the current git state. No code change is needed for `helpers.ts`.

---

## Step 2: Verify the build stage passes

The build agent is currently running the `build` stage with the `build.md` prompt (primary mode, tools: read/write/edit/bash/glob/grep). The build should:
1. Read the task context (`task.md`)
2. Read existing `src/utils/helpers.ts`
3. Confirm the default export is present
4. Run `pnpm tsc --noEmit` to verify no type errors
5. Complete successfully

**Verification command** (run after build agent finishes):
```bash
pnpm tsc --noEmit
```
Expected: **zero type errors**

---

## Step 3: Verify the verify stage skips tests

The Kody engine sets `skipTests: isHotfix = true` which prevents the test command from being added to the quality gates. The verify stage should:
1. Run `pnpm tsc --noEmit` — typecheck only
2. **NOT** run `pnpm test`

**Manual verification**: Check the verify agent's output log for evidence that tests were skipped (search for "skip" or absence of `pnpm test` in the output).

---

## Step 4: Verify only 3 stages ran (build/verify/ship)

**Expected final status.json**:
```json
{
  "taskId": "hotfix-2589-260418-091447",
  "state": "completed",
  "stages": {
    "taskify": { "state": "completed" | "skipped" },
    "plan":    { "state": "completed" | "skipped" },
    "build":   { "state": "completed" },
    "verify":  { "state": "completed" },
    "review":  { "state": "completed" | "skipped" },
    "review-fix": { "state": "completed" | "skipped" },
    "ship":    { "state": "completed" }
  }
}
```

---

## Step 5: Verify PR was created

After the ship stage completes, verify a PR was opened:
```bash
gh pr list --repo <owner>/<repo> --state open --json title,number,url
```

Expected: A PR titled with the hotfix task ID or the fix description.

---

## Critical Files

| File | Role |
|------|------|
| `src/utils/helpers.ts` | Target file — already has `export default helpers` |
| `.kody/steps/build.md` | Build stage prompt (primary mode, read/write/edit/bash/glob/grep) |
| `.kody/tasks/hotfix-2589-260418-091447/status.json` | Live pipeline status |
| `node_modules/@kody-ade/engine/dist/bin/cli.js` | Engine source — defines `hotfix` behavior |

---

## Verification Checklist

- [ ] `src/utils/helpers.ts` has `export default helpers` ✅ (already confirmed)
- [ ] `pnpm tsc --noEmit` exits with code 0
- [ ] Verify stage output shows typecheck but NOT `pnpm test`
- [ ] `status.json` shows only `build`, `verify`, `ship` stages as `completed`
- [ ] `gh pr list` shows an open PR for this task
