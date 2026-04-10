# Test Suite — Testing Guide

This file supplements `agent.md` with patterns for testing specific edge cases.

---

## T19: fix-ci — Simulating a CI Failure

The `fix-ci-trigger` job fires when a **separate CI workflow** (not kody.yml) fails on a PR. The tester repo does not have a separate CI workflow by default, so T19 must create one.

### Protocol

**Step 1 — Add a breakable CI workflow** (if not already present):

Create `.github/workflows/test-ci.yml` on a feature branch:
```yaml
name: Test CI
on: [pull_request]
jobs:
  health:
    runs-on: ubuntu-latest
    steps:
      - run: echo "CI health check"
```

**Step 2 — Break it deliberately** (for T19 only):

After Kody creates the PR, push a commit that introduces a failure:
```bash
git checkout <pr-branch>
# Add a failing step to the CI workflow
echo -e "\njobs:\n  health:\n    runs-on: ubuntu-latest\n    steps:\n      - run: exit 1  # intentionally break CI" >> .github/workflows/test-ci.yml
git add .github/workflows/test-ci.yml
git commit -m "chore: break CI for T19 test [skip ci]"
git push origin <pr-branch>
```

**Step 3 — Verify fix-ci-trigger fires:**

1. The `workflow_run` event fires when `test-ci.yml` completes with `failure`
2. The `fix-ci-trigger` job checks its loop guard (no prior fix-ci comment in 24h)
3. It posts `@kody fix-ci` on the PR
4. The pipeline re-runs on the PR with `mode=fix-ci`

**Step 4 — Verify the fix:**

Check that Kody diagnosed the failure and pushed a fix commit.

**Step 5 — Cleanup:**

Restore the original CI workflow state after the test completes.

---

## Concurrency Isolation

Each workflow run has its own concurrency group (`kody-<run_id>`), so test-suite runs do not interfere with each other or with production runs on the same issue. With `cancel-in-progress: false`, queued runs execute in order rather than cancelling.

If a test needs to ensure no other runs are active before proceeding:
- Poll `gh run list --workflow=kody --limit=1` and wait for no `in_progress` runs.
- Use `gh run watch <id>` to monitor completion before triggering the next test.

---

## Interpreting INCONCLUSIVE Results

A test result of INCONCLUSIVE means the test could not reach a clear pass/fail verdict, typically due to:

| Cause | Solution |
|-------|----------|
| Run was cancelled by a concurrent trigger | Wait for active runs to finish before creating the next test issue |
| Pipeline paused (question gate or risk gate) | Answer the question or approve via `@kody approve` |
| Run re-triggered mid-execution | Use `--task-id` to target a specific run; avoid re-commenting `@kody` on the same issue |
| Workflow run ID collision | Each run is now isolated by `github.run_id` — this should not occur |

---

## Cleanup Checklist

After each run:

1. Close all `test-suite-temp` issues (PASS: close; INCONCLUSIVE/SKIPPED: close without action)
2. Close PRs created by test issues (do not merge unless explicitly testing merge behavior)
3. If T19 was run: restore any broken CI workflow files and remove the test-ci.yml if added
4. Remove any temporary branches created for CI simulation
5. Verify no `test-suite-temp` labeled issues remain open
