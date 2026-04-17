# Plan: P1T19 — Fix-CI auto-trigger verification

## Context

T19 is a **Kody pipeline verification task** that tests the `fix-ci-trigger` job in `.github/workflows/kody.yml` (lines 316–340). The job is designed to fire automatically when CI fails on a PR — via the `workflow_run` event — and run `kody-engine fix-ci-trigger` to post a `@kody fix-ci` comment on the PR (with a 24h loop guard).

This task does **not** implement new code. The `fix-ci-trigger` job already exists. The goal is to **execute gh/git commands** to simulate a CI failure and verify the end-to-end chain fires correctly.

---

## Execution Model

**Constraint:** This agent session is sandboxed to `~/.kody/tasks/2408-260417-234637/`. It cannot access the repo root or run gh/git commands directly from this session.

**Execution path:** This build-stage agent documents exact commands; the orchestrator runs them and reports back. The `kody` skill (SKILL.md) documents how to trigger and monitor pipeline runs.

---

## Verified Assets (from prior exploration)

| File | Relevant Content |
|------|-----------------|
| `.github/workflows/kody.yml` | `fix-ci-trigger` job at lines 316–340; `workflow_run` trigger at line 55–57; `workflow_dispatch` at line 4; `issue_comment` at line 46–47 |
| `.claude/skills/kody/SKILL.md` | `@kody fix-ci` trigger syntax; pipeline monitoring; 24h loop guard |

---

## Implementation Steps

### Step 1 — Verify preconditions

Before breaking CI, confirm:
1. `fix-ci-trigger` job exists in `.github/workflows/kody.yml` (lines 316–340)
2. The job triggers on `workflow_run` with `conclusion == 'failure'` and `event == 'pull_request'`
3. The job runs `kody-engine fix-ci-trigger`

**Verification:** Read `.github/workflows/kody.yml` lines 55–57 and 316–340.

### Step 2 — Ensure a PR exists to test against

The `fix-ci-trigger` job fires only when `github.event.workflow_run.event == 'pull_request'`. We need an existing open PR.

```bash
# Identify an open PR (or the Kody-created PR from earlier tasks)
gh pr list --state open --json number,title,headRefName
```

### Step 3 — Ensure `test-ci.yml` workflow exists on main

The `workflow_run` trigger listens for `"CI"` workflow by name (line 56). We need a workflow named `"CI"` on `main` with a `pull_request` trigger.

```bash
# Create .github/workflows/test-ci.yml on main (if it doesn't exist)
gh api repos/aharonyaircohen/Kody-Engine-Tester/contents/.github/workflows/test-ci.yml \
  --method PUT \
  --field message='ci: add test-ci for T19 [skip ci]' \
  --field content=$(echo 'name: CI
on: [pull_request]
jobs:
  health:
    runs-on: ubuntu-latest
    steps:
      - run: echo CI health check' | base64 -w0)
```

### Step 4 — Break CI on the PR branch

From the PR branch (fetched and checked out in the orchestrator session with repo access):

```bash
# Fetch and check out the PR branch
git fetch origin <pr-branch>
git checkout <pr-branch>

# Append a failure step to test-ci.yml
cat >> .github/workflows/test-ci.yml << 'YAML'
      - run: exit 1  # intentionally break CI for T19 test
YAML

# Commit and push the break
git add .github/workflows/test-ci.yml
git commit -m 'chore: break CI for T19 test [skip ci]'
git push origin <pr-branch>
```

### Step 5 — Verify `fix-ci-trigger` job fires

1. In the GitHub Actions UI, find the `workflow_run` event triggered by the push from Step 4
2. Confirm the `kody` workflow ran and the `fix-ci-trigger` job executed (not skipped)
3. Check the job logs for `kody-engine fix-ci-trigger` output

```bash
# Poll for the workflow_run triggered run
gh run list --workflow kody.yml --event workflow_run --limit 5
gh run view <run-id> --log
```

### Step 6 — Verify `@kody fix-ci` comment posted on PR

After `fix-ci-trigger` runs, check the PR for a new comment from the Kody bot:

```bash
# Find the PR that received the @kody fix-ci comment
gh pr view <pr-number> --json comments
# Look for a comment body containing "fix-ci" or "@kody"
```

### Step 7 — Verify loop guard (24h check)

Post `@kody fix-ci` again on the PR manually within 24h of the first comment. The loop guard should suppress the second comment.

```bash
# Manually post @kody fix-ci on the PR
gh pr comment <pr-number> --body "@kody fix-ci"

# Verify NO new @kody comment appeared (loop guard active)
gh pr view <pr-number> --json comments
```

Expected: loop guard passes — second `@kody fix-ci` NOT auto-posted.

### Step 8 — Clean up

Revert the break-CI commit from the PR branch:

```bash
git checkout <pr-branch>
git revert HEAD  # revert the break-ci commit
git push origin <pr-branch>
```

Or more surgically:
```bash
git rebase -i HEAD~2  # drop the break-ci commit
git push --force-with-lease origin <pr-branch>
```

---

## Verification Checklist

| # | Criterion | Pass/Fail |
|---|-----------|-----------|
| 1 | `fix-ci-trigger` job exists in `kody.yml` lines 316–340 | Confirmed |
| 2 | `workflow_run` trigger configured for `"CI"` workflow | Confirmed (line 56) |
| 3 | `fix-ci-trigger` condition: `conclusion == 'failure'` AND `event == 'pull_request'` | Confirmed (lines 317–320) |
| 4 | Breaking CI on PR branch triggers `workflow_run` event → `kody` workflow | Pending |
| 5 | `fix-ci-trigger` job executes (not skipped) | Pending |
| 6 | `@kody fix-ci` comment posted on PR after CI failure | Pending |
| 7 | Loop guard suppresses second `@kody fix-ci` within 24h | Pending |
| 8 | Break-CI commit reverted after verification | Pending |
