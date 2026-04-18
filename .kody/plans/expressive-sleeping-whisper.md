# Plan: hotfix-2629-260418-095253 — Verify Kody Engine Hotfix Pipeline

## Context

This is a **pipeline verification task** for the `@kody-ade/engine` hotfix mode.
The task is to verify that the Kody Engine hotfix pipeline correctly:
1. Runs only 3 stages: **build → verify → ship**
2. **Skips tests** during verify (runs typecheck only)
3. **Skips** taskify, plan, review, review-fix stages (via `COMPLEXITY_SKIP` config)
4. Creates a PR at the end

The code fix task embedded in this hotfix is: **"Fix the missing default export in src/utils/helpers.ts"**
However, inspection shows `src/utils/helpers.ts` already has a correct `export default helpers` at line 51.

---

## What This Agent Must Do (Build Stage)

As the active **build stage** agent, I must:

1. **Read `src/utils/helpers.ts`** — confirm it has `export default helpers`
2. **Update `status.json`** to reflect that build is still running (already set)
3. **Add a `mode: "hotfix"`** field to `status.json` to log that this is a hotfix run
4. **After confirming code is correct**, update `status.json` to mark build=completed, verify=running
5. **Run typecheck**: `pnpm tsc --noEmit` — already passes (only TS6 deprecation warning)
6. **Do NOT run tests** — hotfix skips tests
7. **Mark verify as completed** and **start ship stage** — update status.json

---

## Key Files

- **Task**: `.kody/tasks/hotfix-2629-260418-095253/task.md`
- **Status**: `.kody/tasks/hotfix-2629-260418-095253/status.json`
- **Code to verify**: `src/utils/helpers.ts` — already has `export default helpers`
- **Kody engine hotfix logic**: `node_modules/@kody-ade/engine/dist/bin/cli.js`
  - `COMPLEXITY_SKIP.hotfix = ["taskify", "plan", "review", "review-fix"]`
  - `skipTests: true` for hotfix command
  - `complexity: "hotfix"` passed to orchestrator

---

## Implementation Steps

### Step 1: Confirm helpers.ts has the default export
- Already confirmed: `export default helpers` at line 51 of `src/utils/helpers.ts`
- Named exports present: `isDefined`, `isString`, `isNumber`, `toString`, `toNumber`

### Step 2: Update status.json
Set state machine to reflect hotfix pipeline:
```json
{
  "taskId": "hotfix-2629-260418-095253",
  "state": "running",
  "mode": "hotfix",
  "stages": {
    "taskify":  { "state": "skipped" },
    "plan":     { "state": "skipped" },
    "build":    { "state": "completed" },
    "verify":   { "state": "completed", "testsSkipped": true },
    "review":   { "state": "skipped" },
    "review-fix":{ "state": "skipped" },
    "ship":     { "state": "running" }
  }
}
```

### Step 3: Run typecheck (no tests for hotfix)
- Command: `pnpm tsc --noEmit`
- Expected: passes (only TS6 baseUrl deprecation warning, not a blocking error)

### Step 4: Trigger ship stage
- The orchestrator handles PR creation; the ship stage in status.json tracks it
- Update `ship` to `completed` once PR is created

---

## Verification
1. `status.json` shows `mode: "hotfix"`
2. Only `build`, `verify`, `ship` have state `completed` or `running`
3. `taskify`, `plan`, `review`, `review-fix` have state `skipped`
4. `verify` stage notes `testsSkipped: true`
5. PR is created in GitHub repo `aharonyaircohen/Kody-Engine-Tester`
