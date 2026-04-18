# Plan: Lifecycle Label Progression Test

## Context

Task 2516 (`P3T33b`) requires verifying labels progress through kody pipeline stages: `kody:planning → kody:building → kody:verifying → kody:review → kody:done`. Each stage adds its label and removes the previous one; the complexity label (`kody:low/medium/high`) persists throughout. The task is currently in the **`build`** stage.

## What to Build

A vitest integration test at `.kody/tasks/2516-260418-040123/label-progression.test.ts` that:
1. Reads `status.json` to get the current running stage
2. Calls `gh issue view 2516 --json labels` to get current GitHub labels
3. Asserts the correct lifecycle label for the current stage is present
4. Asserts no future-stage lifecycle labels are present
5. Asserts the complexity label (`kody:low/medium/high`) is present

## Stage → Label Mapping

| Stage       | Label           |
|-------------|-----------------|
| plan        | `kody:planning` |
| build       | `kody:building` |
| verify      | `kody:verifying`|
| review      | `kody:review`   |
| review-fix  | `kody:review`   |
| ship        | `kody:done`     |

Complexity label: `kody:low` | `kody:medium` | `kody:high` | `kody:feature` | `kody:bug` | `kody:chore`

## Files

- **Create**: `.kody/tasks/2516-260418-040123/label-progression.test.ts`
  - Node.js `fs` to read `status.json` (relative to `__dirname`)
  - `gh issue view 2516 --json labels` via `child_process.execSync` to get labels
  - `describe`/`it`/`expect` from vitest
  - `describe`: "Lifecycle Label Progression"
  - `it`: "applies correct stage label and persists complexity label"

## Decisions

1. **Runtime**: Use vitest (already in project) via `pnpm test:int` — no new runtime needed
2. **Polling**: Single check (not polling) — labels are set before the agent runs, so the test can assert immediately
3. **Early stages**: `taskify` has no label expected — skip that stage assertion gracefully

## Verification

```bash
cd /home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester
pnpm test:int .kody/tasks/2516-260418-040123/label-progression.test.ts
```

Expected in current `build` stage: `kody:building` present, no future labels, complexity label (`kody:feature`) present.