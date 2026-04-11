# Verification Report: T26 Decompose --no-compose Flag

**Task ID:** task-2008-v6
**Date:** 2026-04-11
**Status:** FAILED - Bug Confirmed

## Acceptance Criteria Status

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Parallel builds complete | UNKNOWN | Build stage currently running |
| decompose-state.json saved | FAIL | File does not exist |
| NO merge/verify/review/ship phases | FAIL | R1 run completed all phases (taskify, plan, build, verify, review, review-fix, ship) |
| No PR created | UNKNOWN | No PR found, but ship failed before PR creation |
| Sub-task branches exist on remote | FAIL | No 2008 branches found on remote |

## Root Cause

The `--no-compose` flag is NOT being respected because:

1. **Parse stage failure**: When `@kody decompose --no-compose` is triggered, `ci-parse` outputs `mode=full` and `valid=false` instead of recognizing `decompose` as a separate mode.

2. **Workflow mode gap**: The GitHub workflow (`.github/workflows/kody.yml`) handles modes like `run`, `rerun`, `fix`, `fix-ci`, `review`, `resolve`, `status`, `hotfix` - but has NO handling for `decompose` mode.

3. **R1 evidence**: The previous run (`2008-retest`) shows:
   - `command: "run"` (not "decompose")
   - All phases completed: taskify → plan → build → verify → review → review-fix → ship
   - This proves `--no-compose` was ignored

## Evidence

### ci-parse output for decompose --no-compose:
```
task_id=
mode=full        ← Should be "decompose"
from_stage=
issue_number=2008
pr_number=
feedback=
complexity=
ci_run_id=
ticket_id=
prd_file=
provider=
model=
bump=
finalize=false
no_publish=false
no_notify=false
revert_target=
dry_run=false
valid=false      ← Command not recognized
trigger_type=comment
```

### R1 Run History (`.kody/runs/2008.jsonl`):
```json
{
  "runId": "2008-retest",
  "command": "run",         ← Should be "decompose"
  "stagesCompleted": ["taskify", "plan", "build", "verify", "review", "review-fix"],
  "outcome": "failed",
  "failedStage": "ship"
}
```

### Remote Branches Check:
```
$ git branch -r | grep "2008"
(no output - no 2008 branches exist)
```

## Fix Required

The workflow needs to be updated in `.github/workflows/kody.yml`:

1. **Parse stage** (around line 63-112): Need to add handling for `decompose` command that sets `mode=decompose` and captures `--no-compose` flag

2. **Orchestrate-from-parse job** (around line 437-455): Need to add:
```yaml
elif [ "$MODE" = "decompose" ]; then
  echo "Running decompose..."
  ARGS="--issue-number $ISSUE_NUMBER"
  [ "$NO_COMPOSE" = "true" ] && ARGS="$ARGS --no-compose"
  kody-engine decompose $ARGS
```

3. **No corresponding orchestrate job** since decompose doesn't use workflow_dispatch directly

## Conclusion

**Bug confirmed**: The `--no-compose` flag is not being respected. The pipeline runs all phases instead of stopping after build. The root cause is the workflow doesn't recognize `decompose` as a valid mode and defaults to `run`, which executes the full pipeline.