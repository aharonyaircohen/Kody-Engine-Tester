# Build Stage Output — T12: `--from build` Flag Test

## Task
Test `@kody --from build` (rerun from build stage, skipping taskify + plan).

## Test Specification (T12 from kody-test-suite)

### Precondition
A prior pipeline run must exist (T01 or equivalent full pipeline must have completed).

### Two-Step Execution
1. **Step 1** — Trigger a full `@kody` pipeline on an issue (establishes a completed run).
2. **Step 2** — After step 1 completes, post `@kody --from build` on the same issue.

### Expected Behavior
When `@kody --from build` is invoked:
- `taskify` stage is **skipped** (not re-executed)
- `plan` stage is **skipped** (not re-executed)
- Execution **resumes from `build`** stage
- Logs contain `Resuming from: build`
- Pipeline re-executes build + verify + review + ship stages
- Not blocked by "already completed" state

### Verification Checks (for verify stage)
Run after step 2 completes:
```bash
# Check logs for stage skip evidence
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "Resuming from: build"

# Check that taskify was NOT re-run
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "taskify"
# Should NOT find "Running taskify" or similar

# Check that plan was NOT re-run
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "Running plan"
# Should NOT find plan execution

# Check that build DID run
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "Running build"
# Should find build execution
```

## Implementation Notes
- This is an E2E test run via GitHub Actions (kody-test-suite workflow).
- The kody CLI parses `--from <stage>` and sets a `fromStage` entry point in the pipeline.
- The pipeline runner must skip all stages before `fromStage` in the execution order.
- Logs must emit `Resuming from: <stage>` when a `fromStage` is provided.
- The pipeline must not be blocked by a "already completed" state when re-running.
