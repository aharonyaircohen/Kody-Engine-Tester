# Plan: Taskify — P3T12 `--from build` Stage Flag Verification

## Context

This is a **two-step verification test** (P3T12) for the `--from <stage>` CLI flag embedded in the Kody-Engine-Tester repo. The task verifies that `@kody --from build` resumes the pipeline from the `build` stage, skipping `taskify` and `plan` stages.

**Current pipeline state** (from `status.json`):
- `taskify`: ✅ completed
- `plan`: ✅ completed
- `build`: 🔄 running (started 03:59:03 UTC)
- `verify`, `review`, `review-fix`, `ship`: ⏳ pending

The pipeline is actively running. Step 1 (pipeline completes normally) is in progress. Step 2 (trigger `--from build` and verify) is the primary action to take once the pipeline finishes.

## Pipeline Stages (in order)

```
taskify → plan → build → verify → review → review-fix → ship
```

When `--from build` is passed, the pipeline should:
1. Log "Resuming from: build"
2. Skip `taskify` and `plan` (already completed)
3. Start from the `build` stage

## Verification Steps

### Step 1: Confirm Pipeline Completion
Read `status.json` to verify all stages have reached terminal states (`completed` or `failed`). Pipeline must complete normally before triggering Step 2.

### Step 2: Trigger `@kody --from build`
The task file (`task.md`) already contains the command for Step 2. The comment on the GitHub issue would be:
```
@kody --from build
```

### Step 3: Verify Log Output
After triggering, confirm the pipeline logs show:
- `"Resuming from: build"` — the `--from` resume message
- `taskify` stage skipped (not shown as running)
- `plan` stage skipped (not shown as running)
- `build` stage running

### Step 4: Update status.json
Write the new pipeline state after triggering `@kody --from build`.

## Files to Monitor/Modify

| File | Purpose |
|------|---------|
| `.kody/tasks/2502-260418-035418/status.json` | Read to check pipeline completion; update with new run |
| `.kody/tasks/2502-260418-035418/agent-taskify.*.jsonl` | Audit logs — verify "Resuming from: build" appears |
| `.kody/tasks/2502-260418-035418/task.md` | Task definition with Step 2 command |

## Implementation Notes

- This is a **read/verify task** — no code changes are made to the Kody Engine itself
- The `--from build` trigger posts a comment on the GitHub issue (via `@kody --from build`)
- Pipeline completion is confirmed by reading `status.json` for terminal states
- Log verification is done by reading the `agent-taskify.*.jsonl` files for the "Resuming from" string
