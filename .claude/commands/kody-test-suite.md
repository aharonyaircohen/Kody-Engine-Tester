---
description: Complete test suite runner for Kody Engine Lite — runs every CLI command and flag combination as live E2E tests, fixes failures, and produces a comprehensive report
---

You are the Kody Complete Test Suite runner. Your job is to systematically run every CLI command and flag combination documented in docs/CLI.md as live end-to-end tests on the https://github.com/aharonyaircohen/Kody-Engine-Tester repo, fix any failures in the engine, and produce a comprehensive report with enhancement recommendations.

## Overview

The suite runs in 5 phases:

```
Phase 1: Independent runs (@kody — low/med/high, dry-run, status, fix-ci)
    ↓ creates PRs + paused pipelines
Phase 2: Dependent commands (@kody fix, approve, rerun, review, resolve)
    ↓ builds on phase 1 outputs
Phase 3: Edge cases & flag combos (--feedback, --from <stage>, --complexity, special chars, multi-branch)
    ↓ fills remaining coverage
Phase 4: Cleanup (merge PRs, close issues, delete branches)
    ↓
Phase 5: Reflect (verify memory, summarize, recommend enhancements)
```

---

## Phase 1: Independent Runs

Create separate issues in the tester repo for each test. Use the prefix `[test-suite]` in issue titles.

**IMPORTANT** — use unique task descriptions that don't overlap with existing code in the repo. Check what already exists first:

```bash
ls src/utils/ src/middleware/ src/auth/ 2>/dev/null
```

Then pick tasks that create NEW files. If a task creates files that already exist, the LLM may produce invalid output instead of structured JSON.

| Test ID | Issue Title | Command | Expected |
|---------|-------------|---------|----------|
| T01 | [test-suite] Simple utility function | `@kody` | LOW complexity, 4 stages, PR created. Uses bare `@kody` (no explicit mode) to exercise default "full" parsing path |
| T02 | [test-suite] Add middleware with tests | `@kody full` | MEDIUM complexity, 6 stages, PR created. Uses explicit `@kody full` to contrast with T01's bare command |
| T03 | [test-suite] Refactor auth system with migration | `@kody` | HIGH complexity, risk gate fires, pauses at plan |
| T04 | [test-suite] Dry run validation | `@kody full --dry-run` | All stages skipped, preflight passes, no PR |
| T19 | [test-suite] Fix-CI auto-trigger | See T19 details below | fix-ci triggers, loop guard prevents re-trigger |
| T20 | [test-suite] Status check | `@kody status` | Prints pipeline state from status.json, no pipeline execution |
| T21 | [test-suite] Taskify file mode | `@kody taskify --file docs/test-prd.md` | Sub-issues filed with priority labels, Test Strategy sections, topo order. See T21 details below |
| T22 | [test-suite] Taskify context injection | `@kody taskify --file docs/test-prd.md` (with `.kody/memory.md` present) | Project memory and file tree appear in taskify stage logs. See T22 details below |

| T24 | [test-suite] Decompose: simple task falls back | `@kody decompose` | complexity_score < 6, falls back to normal pipeline, PR created via runPipeline(). See T24 details below |
| T31 | [test-suite] Bootstrap: extend mode | `@kody bootstrap` | Generates/extends memory, step files, tools.yml, labels. See T31 details below |
| T33 | [test-suite] Bootstrap: model override | `kody-engine-lite bootstrap --provider=minimax --model=MiniMax-M1 --force` | CLI flags override config model. See T33 details below |
| T32 | [test-suite] Watch: health monitoring | `@kody watch --dry-run` (local) | Runs watch plugins, posts findings to digest issue. See T32 details below |
| T25 | [test-suite] Decompose: complex multi-area task | `@kody decompose` | Scores 6+, splits into 2+ sub-tasks, parallel build, merge, verify, review, ship. PR body has "Decomposed Implementation" section. See T25 details below |
| T26 | [test-suite] Decompose: --no-compose flag | `@kody decompose --no-compose` | Stops after parallel build. decompose-state.json saved. No PR created. See T26 details below |
| T37 | [test-suite] Hotfix: fast-track pipeline | `@kody hotfix` | Skips taskify/plan/review, runs build → verify (no tests) → ship. PR created with hotfix label. See T37 details below |
| T40 | [test-suite] Release: dry-run | `@kody release --dry-run` | Parses conventional commits, determines bump, generates changelog — no PR created. See T40 details below |
| T41 | [test-suite] Release: create release PR | `@kody release` | Bumps version, generates changelog, creates release PR targeting default branch. See T41 details below |

**Parallelization:** T01-T04 can all trigger simultaneously (separate issues, no dependencies). T19-T26, T37, and T40 can run in parallel with T01-T04.

For each test:

1. Create issue: `gh issue create --repo aharonyaircohen/Kody-Engine-Tester --title "<title>" --body "<body>"`
2. Trigger: `gh issue comment <n> --repo aharonyaircohen/Kody-Engine-Tester --body "<command>"`
3. Wait for workflow: `gh run list --repo aharonyaircohen/Kody-Engine-Tester --workflow=kody.yml --limit 5`
4. Monitor: `gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester`
5. Verify: check issue comments, labels, PR creation

Launch T01-T04 in parallel — create all issues and trigger all commands at once, then monitor all runs.

### T03 — Contingency plan

T03 must pause at the risk gate for T05 (approve) to work. If T03 doesn't pause (e.g., complexity auto-detected as MEDIUM instead of HIGH):

1. Check if complexity was detected correctly: `gh run view <id> --log | grep "Complexity"`
2. If wrong complexity: close T03's issue, recreate with a more unambiguously HIGH task (e.g., "Redesign the entire authentication system: replace session-based auth with JWT, migrate the user schema, add RBAC with admin/editor/viewer roles, and update all API routes")
3. Alternative: comment `@kody rerun --from plan` with a separate comment `@kody full --complexity high` to force HIGH

### T19 — fix-ci auto-trigger

This tests the `fix-ci-trigger` workflow job and its loop guard:

1. Use a PR created by T01 or T02
2. Push a commit that breaks CI (e.g., introduce a type error in a test file)
3. Wait for CI to fail — the workflow should auto-post `@kody fix-ci` on the PR
4. Verify:
   - `@kody fix-ci` comment appears on the PR (auto-posted by `fix-ci-trigger` job)
   - Pipeline runs with `fix-ci` mode, fetches CI failure logs, rebuilds from build
   - Fix is pushed to the same PR
5. Loop guard check: If the fix-ci run itself fails, verify that a **second** `@kody fix-ci` is NOT auto-posted (loop guard: "already commented in last 24h")
6. Also verify bot commit guard: last commit author check prevents infinite loops

### T20 — status command

1. Use an issue from T01 or T02 that has completed
2. Comment `@kody status` on the issue
3. Verify: Pipeline state is printed (from status.json), no stages are executed
4. Check that the status output includes stage states (completed/failed/skipped)

### T21 — taskify file mode (priority labels + Test Strategy + topo order)

This is the first dedicated test of the standalone `@kody taskify` command.

**Setup:**

1. Create a PRD file in the tester repo with a spec that has at least 3 tasks with natural ordering (e.g., "Add auth model → Add auth API → Protect routes with auth"):
   ```bash
   gh api repos/aharonyaircohen/Kody-Engine-Tester/contents/docs/test-prd.md \
     --method PUT \
     --field message="test: add PRD for T21" \
     --field content="$(echo '# Auth Feature
   Add JWT authentication.

   ## Tasks
   1. Add User model with password hash field
   2. Add /login and /register endpoints (depends on User model)
   3. Add auth middleware to protect existing routes (depends on endpoints)' | base64)"
   ```
2. Create an issue and comment: `@kody taskify --file docs/test-prd.md`

**Verification:**

1. Wait for the workflow to complete
2. List sub-issues created by taskify:
   ```bash
   gh issue list --repo aharonyaircohen/Kody-Engine-Tester --state open --search "[test-suite]" --json number,title,labels,body
   ```
3. **Priority labels check** — every sub-issue must have exactly one priority label:
   ```bash
   gh issue list --repo aharonyaircohen/Kody-Engine-Tester --json number,labels | \
     jq '.[] | {number, priority: [.labels[].name | select(startswith("priority:"))]}'
   ```
   - PASS: each issue has one of `priority:high`, `priority:medium`, `priority:low`
   - FAIL: any issue has no priority label or multiple priority labels

4. **Test Strategy section check** — every sub-issue body must contain `## Test Strategy`:
   ```bash
   for n in <issue-numbers>; do
     body=$(gh issue view $n --repo aharonyaircohen/Kody-Engine-Tester --json body -q '.body')
     echo "$body" | grep -q "## Test Strategy" && echo "#$n OK" || echo "#$n MISSING Test Strategy"
     echo "$body" | grep -q "## Context" && echo "#$n Context OK" || echo "#$n MISSING Context"
     echo "$body" | grep -q "## Acceptance Criteria" && echo "#$n AC OK" || echo "#$n MISSING Acceptance Criteria"
   done
   ```
   - PASS: all three sections present in every issue body
   - FAIL: any section missing

5. **Topological order check** — issues depending on earlier tasks must have higher issue numbers (filed later):
   - For the auth example: User model issue# < endpoints issue# < middleware issue#
   - FAIL: if dependency order is violated (e.g., middleware filed before endpoints)

### T22 — taskify context injection

This tests that taskify receives project context (memory + file tree) instead of operating in a vacuum.

**Setup:**

1. Ensure `.kody/memory.md` exists in the tester repo with project conventions
2. Create an issue and comment: `@kody taskify --file docs/test-prd.md`

**Verification:**

1. Check workflow run logs for the taskify stage:
   ```bash
   gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "memory\|file tree\|context"
   ```
2. **Project memory check**: Logs should show memory content being injected into the taskify prompt
3. **File tree check**: Logs should show `git ls-files` output or similar file listing being injected
4. **Template resolution check**: No raw `{{ }}` template tokens should appear in logs
5. PASS: Both memory and file tree appear in taskify stage logs
6. FAIL: Either is missing, or raw template tokens appear

### T24 — Decompose: simple task falls back to normal pipeline

This tests the fail-open fallback when a task isn't complex enough to decompose.

1. Create a simple issue (1-2 files, single area): e.g., "Add a string capitalize utility function in src/utils/strings.ts with tests"
2. Comment `@kody decompose` on the issue
3. **Verification:**
   - Check logs for decompose decision:
     ```bash
     gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "complexity_score\|not decomposable\|falling back\|Delegating to normal pipeline"
     ```
   - Expected: `complexity_score` is < 6 OR `not decomposable`, followed by "Delegating to normal pipeline"
   - Pipeline completes via normal `runPipeline()` path — PR created normally
   - `decompose.json` artifact may exist with `decomposable: false`
   - FAIL if: decompose attempts parallel build on a simple task

### T25 — Decompose: complex multi-area task (full flow)

This tests the full decompose → parallel build → compose flow end-to-end.

**Setup:**

Create an issue that clearly spans multiple independent areas (4+ files, 2+ directories):
```
Title: [test-suite] Decompose: complex multi-area task
Body:
Add a complete notification system:
1. Create a notification model in src/models/notification.ts with types (info, warning, error) and read/unread status
2. Create notification service in src/services/notificationService.ts with CRUD operations and mark-as-read
3. Add notification API routes in src/routes/notifications.ts (GET /notifications, POST /notifications, PATCH /notifications/:id/read)
4. Add notification utility helpers in src/utils/notificationHelpers.ts for formatting and filtering
5. Add unit tests for all new modules
```

**Verification:**

1. Check decompose analysis:
   ```bash
   gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "decompose\|sub-task\|complexity_score\|parallel"
   ```
   - Expected: `complexity_score` >= 6, `decomposable: true`, 2+ sub-tasks listed

2. Check parallel build:
   ```bash
   gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "worktree\|part-1\|part-2\|parallel build"
   ```
   - Expected: Worktrees created for each sub-task, builds run concurrently

3. Check merge + compose:
   ```bash
   gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "merge\|compose\|verify\|review\|ship"
   ```
   - Expected: All sub-task branches merged, verify passes, review runs, PR created

4. Check PR body for decompose section:
   ```bash
   gh pr list --repo aharonyaircohen/Kody-Engine-Tester --state open --search "[test-suite] Decompose: complex" --json number,body | jq -r '.[0].body' | grep -A 5 "Decomposed Implementation"
   ```
   - Expected: "Decomposed Implementation" section lists sub-tasks with file counts

5. Check artifacts:
   ```bash
   gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "decompose-state.json\|decompose.json"
   ```
   - Expected: Both files saved in task directory

6. Check worktree cleanup:
   ```bash
   gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "worktree removed\|cleaned up"
   ```
   - Expected: Worktrees cleaned up after merge

- PASS: Full flow completes — parallel build, merge, verify, review, ship — with decomposed PR body
- FAIL: Falls back to normal pipeline despite complex task, OR sub-tasks have overlapping files, OR merge conflicts

### T26 — Decompose: --no-compose flag

This tests that `--no-compose` stops after parallel builds and preserves state for manual compose.

1. Create a complex issue similar to T25
2. Comment `@kody decompose --no-compose` on the issue
3. **Verification:**
   ```bash
   gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "auto-compose\|no-compose\|decompose-state"
   ```
   - Expected: Parallel builds complete, `decompose-state.json` saved, NO merge/verify/review/ship phases
   - No PR created
   - `decompose-state.json` contains `subPipelines` with outcomes but no `compose` field
   - Sub-task branches exist on remote (pushed during build)
- PASS: Builds complete, state saved, no compose triggered
- FAIL: Compose runs despite --no-compose flag, OR state file missing

### T31 — Bootstrap: extend mode + tools detection + skills.sh

This tests the bootstrap command's ability to analyze the codebase and generate project-aware artifacts.

1. Comment `@kody bootstrap` on any issue in the tester repo
2. **Verification:**
   ```bash
   gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "memory\|step file\|tools\|skills\|label\|extend"
   ```
   - **Memory generated**: `.kody/memory/` contains `architecture.md` and/or `conventions.md`
   - **Step files generated**: `.kody/steps/` contains `taskify.md`, `plan.md`, `build.md`, `review.md`, `autofix.md`, `review-fix.md`
   - **Tools detected**: `.kody/tools.yml` exists with detected tools (e.g., Playwright if configured)
   - **Skills installed**: Check for skills from skills.sh in `.kody/tools.yml` skill fields
   - **Labels created**: 14 lifecycle labels exist on the repo:
     ```bash
     gh label list --repo aharonyaircohen/Kody-Engine-Tester | grep "kody:"
     ```
   - **Extend mode**: If `.kody/steps/` already existed, files were extended (not overwritten). Check logs for "extending" vs "creating"
- PASS: All artifacts generated, labels created, skills resolved
- FAIL: Missing artifacts, labels not created, or step files overwritten instead of extended

### T33 — Bootstrap: model override via CLI flags

This tests that `--provider` and `--model` flags override the model resolved from `kody.config.json`.

1. Run locally in the tester repo:
   ```bash
   kody-engine-lite bootstrap --provider=minimax --model=MiniMax-M1 --force
   ```
2. **Verification:**
   - **Log output**: First lines show `Model: MiniMax-M1 (provider: minimax)` — NOT the config default
   - **LiteLLM proxy started**: Logs show "Starting LiteLLM proxy for minimax" (non-claude provider triggers proxy)
   - **Artifacts generated**: `.kody/memory/` and `.kody/steps/` populated as normal
   - **Equals and space forms**: Both `--model=MiniMax-M1` and `--model MiniMax-M1` work identically
- PASS: Logs confirm override model/provider used, artifacts generated successfully
- FAIL: Logs show config model instead of CLI override, or flags ignored

### T32 — Watch: health monitoring (dry-run)

This tests the Kody Watch system locally. Watch runs in CI via cron, but `--dry-run` validates locally.

**Precondition:** Tester repo must have `watch.enabled: true` and a `watch.digestIssue` configured in `kody.config.json`. Check:
```bash
gh api repos/aharonyaircohen/Kody-Engine-Tester/contents/kody.config.json | jq -r '.content' | base64 -d | jq '.watch'
```

1. Run locally: `kody-engine-lite watch --dry-run --cwd /path/to/Kody-Engine-Tester`
2. **Verification:**
   - Pipeline health plugin ran: check output for stalled/failed task scan
   - Security scan plugin ran (if on daily cycle): check for secrets/CVE scan
   - Config health plugin ran (if on daily cycle): check for config validation
   - `--dry-run` mode: no comments posted to GitHub (verify no new comments on digest issue)
   - Watch state persisted: `.kody/watch-state.json` updated with cycle counter
- PASS: Plugins execute, findings logged, no GitHub posts in dry-run
- FAIL: Watch crashes, plugins don't run, or dry-run still posts to GitHub

---

## Phase 2: Dependent Commands

These tests depend on Phase 1 outputs. Wait for Phase 1 to complete before starting.

| Test ID | Depends on | Command | Setup | Expected |
|---------|-----------|---------|-------|----------|
| T05 | T03 (paused) | `@kody approve` | Comment on T03's issue | Pipeline resumes from plan, completes, PR created |
| T06 | T01 or T02 (PR) | `@kody review` | Comment on the PR | Review comment posted with findings referencing files from the PR diff |
| T07 | T06 (reviewed PR) | `@kody fix` | Comment on the PR | Rebuilds from build, pushes to same PR |
| T07b | T07 (fixed PR) | `@kody review` | Comment on the PR after fix | Re-review posted; findings should differ from T06 (fixes addressed) |
| T08 | Any completed PR | `@kody resolve` | Create conflict on a test branch, then comment on PR | Merges base, resolves conflicts, verifies, pushes |
| T09 | Any task | `@kody rerun --from verify` | Comment on an issue with a completed task | Reruns from verify stage. Also validates state bypass — rerun on completed issue is not blocked by "already completed" lock |
| T28 | T26 (no-compose) | `@kody compose` | Comment on T26's issue with task-id | Reads decompose-state.json, merges sub-task branches, verify, review, ship. PR created. See T28 details below |
| T29 | T28 (compose) | `@kody compose` (retry) | Simulate compose failure then retry | Skips merge (already done), retries from verify. See T29 details below |
| T38 | Any merged PR (Phase 4) | `@kody revert #<PR>` | Comment on any issue | Reverts the merged PR, runs full verify, creates revert PR. See T38 details below |
| T39 | T38's issue | `@kody revert` (no target) | Comment on issue whose PR was reverted | Finds the linked merged PR via branch naming convention and reverts it. See T39 details below |

### T06 — Deep review verification

After `@kody review` completes, don't just check "review was posted". Verify review quality:

1. Get the PR diff files: `gh pr diff <n> --repo aharonyaircohen/Kody-Engine-Tester | grep "^diff --git" | grep -v ".kody/"`
2. Read the review comment from issue comments
3. Check that review findings reference files from the PR diff — not random repo files
4. Check for the diff command in the run logs: look for `git diff origin/<base>...HEAD` (not bare `git diff`)
   `gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep "git diff"`
5. If review findings don't match PR diff files, this is a critical bug — the review is reading the wrong changes

### T07 -> T07b — Review-fix-review loop

This tests the full feedback cycle:

1. T07: After T06's review, comment `@kody fix` on the PR
2. Verify T07: Fix pushed to the same PR (not a new PR), commit message references the fix
3. T07b: Comment `@kody review` again on the same PR
4. Verify T07b:
   - New review comment is posted (not a duplicate of T06's review)
   - Review findings should acknowledge the fixes OR find new/remaining issues
   - If verdict was FAIL in T06, check if it changed (PASS or different FAIL reasons)
   - The review should diff against the base branch (check logs for `git diff origin/<base>...HEAD`)

### T08 setup — creating a real conflict (safe method)

**Do NOT modify the default branch directly.** Instead, use the PR's base branch to create an isolated conflict:

1. Identify a file the PR modified (check PR diff — use non-`.kody` files)
2. Identify the PR's base branch: `gh pr view <n> --json baseRefName`
3. Create a conflict commit on the base branch that modifies the same lines in that file:
   ```bash
   git fetch origin <base>
   git checkout <base>
   # Edit the conflicting file
   git commit -m "test: create conflict for T08 resolve test"
   git push origin <base>
   ```
4. Comment `@kody resolve` on the PR
5. Verify: PR branch now includes both changes (merged), resolve comment confirms success
6. **Mandatory cleanup in Phase 4:** Revert the conflict commit from the base branch:
   ```bash
   git revert <conflict-commit-hash> --no-edit
   git push origin <base>
   ```
7. Verify cleanup: `gh api repos/aharonyaircohen/Kody-Engine-Tester/commits?sha=<base>&per_page=3` — conflict commit should be reverted

### T28 — Compose: merge + verify + review + ship

This tests the standalone compose command consuming state from T26's `--no-compose` run.

1. Get the task-id from T26's workflow run logs:
   ```bash
   gh run view <T26-run-id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep "Task:"
   ```
2. Comment on T26's issue: `@kody compose --task-id <task-id-from-T26>`
3. **Verification:**
   ```bash
   gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "compose phase\|merge\|verify\|review\|ship\|decompose-state"
   ```
   - Expected: Reads decompose-state.json, merges all sub-task branches, runs verify+review, ships PR
   - Logs show "Compose Phase 1: Merge" → "Compose Phase 2: Verify + Review" → "Compose Phase 3: Ship"
   - PR created with "Decomposed Implementation" section in body
   - decompose-state.json updated with `compose` field showing verify/review/ship outcomes
   - Worktrees cleaned up after merge
- PASS: Full compose flow completes, PR created
- FAIL: State file not found, merge conflicts, or verify/review fails without retry

### T29 — Compose: re-runnable (retry after failure)

This tests that compose skips already-completed merge and retries from verify.

**Setup:** This requires simulating a compose failure. Two approaches:

**Approach A (natural):** If T28's compose naturally fails at verify or review, use the same issue — just re-run `@kody compose --task-id <same-task-id>`.

**Approach B (forced):** If T28 succeeded:
1. Manually edit `decompose-state.json` in the task directory to set `compose.verify: "failed"` and remove the `compose.ship` field
2. Comment `@kody compose --task-id <task-id>` again

**Verification:**
```bash
gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "merge.*skip\|already merged\|compose phase"
```
- Expected: "Compose Phase 1: Merge (skipped — already merged)" appears in logs
- Verify and review re-execute (not skipped)
- Ship completes
- PASS: Merge skipped, verify/review/ship retry successfully
- FAIL: Merge re-attempted (causing errors), or compose can't find state file

---

## Phase 3: Edge Cases & Flag Combos

| Test ID | Issue Title | Command | Expected |
|---------|-------------|---------|----------|
| T10 | [test-suite] Flag: complexity override | `@kody --complexity low` | Forced LOW, 4 stages regardless of task. Logs show "Complexity override:" (not "auto-detected:") |
| T11 | [test-suite] Flag: feedback injection | `@kody --feedback "Use functional style"` | Feedback appears in build stage logs: `feedback: Use functional style` |
| T12 | [test-suite] Rerun from specific stage | `@kody rerun --from build` | Skips taskify+plan, runs from build. Logs show "Resuming from: build" |
| T13 | [test-suite] State bypass on rerun | `@kody rerun` on completed issue | Rerun bypasses "already completed" state lock, pipeline re-executes |
| T14 | [test-suite] UI task with MCP auto-inject | `@kody` (UI task) | hasUI=true in task.json, Playwright MCP auto-injected (check logs for MCP config) |
| T15 | [test-suite] PR title from issue title | `@kody` | PR title uses issue title with type prefix (`feat: <issue title>`), NOT LLM-generated verbose title |
| T16 | [test-suite] Issue stays open after PR | `@kody` | After PR created, issue remains OPEN. PR body contains `Closes #N`. Issue closes only on PR merge. |
| T17 | [test-suite] Feedback with special chars | `@kody fix` with body: `Please use "quotes" and backticks` | Feedback parsed correctly through both shell and TS parsers, no shell injection, pipeline completes |
| T18 | [test-suite] Force-with-lease on rerun push | `@kody rerun --from build` (after prior push) | If push fails non-fast-forward, retries with --force-with-lease. Check logs for "retrying with --force-with-lease" |
| T23 | [test-suite] Issue attachments and metadata enrichment | `@kody` | Image attachments downloaded to `attachments/`, task.md has local paths + labels + discussion. See T23 details below |
| T27 | [test-suite] Decompose: config disabled | `@kody decompose` (with `decompose.enabled: false`) | Falls back to normal pipeline immediately. See T27 details below |
| T30 | [test-suite] Decompose: sub-task failure fallback | `@kody decompose` | Sub-task failure triggers cleanup + fallback. See T30 details below |
| T33 | [test-suite] Lifecycle label progression | `@kody` | Labels progress: planning→building→verifying→review→done. See T33 details below |
| T34 | [test-suite] Token ROI in retrospective | `@kody` | Retrospective entry in observer-log.jsonl includes tokenStats. See T34 details below |
| T35 | [test-suite] Auto-learn before ship | `@kody` | Memory files committed in PR (auto-learn runs before ship). See T35 details below |
| T36 | [test-suite] Engine-managed dev server | `@kody` (UI task with devServer config) | Engine starts/stops dev server, KODY_DEV_SERVER_READY in logs. See T36 details below |

### T10 — Complexity override verification

After run completes, check logs for the specific log line:

```bash
gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep "Complexity"
gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep "COMPLEXITY="
```

- Expected: `Complexity override: low` (taskify -> build -> verify -> ship)
- Also verify env var propagation: `COMPLEXITY=low` should appear in the orchestrate job env
- FAIL if: `Complexity auto-detected: low` — means the flag wasn't recognized, auto-detection coincidentally matched

### T11 — Feedback injection verification

After run completes, check logs:

```bash
gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep "feedback:"
gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep "FEEDBACK="
```

- Expected: `feedback: Use functional style` line during the build stage
- Also verify the FEEDBACK env var was set in the orchestrate job

### T12 — Rerun from build

Verify in logs that:
- `Resuming from: build` appears
- taskify and plan stages are NOT executed (no `[taskify] starting...` or `[plan] starting...`)
- build stage IS executed (`[build] starting...`)

### T13 — State bypass for rerun

This exercises the fix from `5f8b7e9` where resolve/rerun were blocked by "already completed" state locks:

1. Use an issue that already has a `kody:done` label from a prior run
2. Comment `@kody rerun`
3. Expected: Pipeline re-executes (not blocked by "already completed" message)
4. FAIL if: Issue comment says "Issue #N already completed"

**Note:** T09 (`@kody rerun --from verify`) also validates this bypass but with a `--from` flag. T13 tests the bare rerun path.

### T14 — UI task MCP auto-inject

**Precondition:** Verify tester repo has MCP devServer configured:

```bash
gh api repos/aharonyaircohen/Kody-Engine-Tester/contents/kody.config.json | jq -r '.content' | base64 -d | jq '.mcp.devServer'
```

If null, add `"mcp": { "devServer": "pnpm dev" }` to kody.config.json as a setup step.

Create a UI-focused issue (e.g., "Add a new dashboard page with charts and data tables"):

1. After taskify completes, verify `task.json` has `hasUI: true`
2. Check logs for MCP configuration showing Playwright server injection
3. If `hasUI: false` but the task is clearly UI, the taskify classifier needs tuning

### T15 — PR title sourcing

After PR is created:

1. Read the PR title via `gh pr view <n> --json title`
2. Read the issue title via `gh issue view <n> --json title`
3. PR title should be `<type>: <issue title>` (e.g., `feat: [test-suite] Simple utility function`)
4. PR title should NOT be a verbose LLM-generated summary from task.json

### T16 — Issue lifecycle (strengthened)

After PR is created (ship stage completes):

1. Check PR body contains `Closes #<issue_number>`:
   ```bash
   gh pr view <n> --repo aharonyaircohen/Kody-Engine-Tester --json body | jq -r '.body' | grep "Closes #"
   ```
2. Check issue state: `gh issue view <n> --json state`
3. Expected: `state: OPEN` (issue should NOT be closed yet — ship.ts no longer calls closeIssue)
4. **Phase 4 verification:** After merging the PR, re-check issue state — should auto-close via the `Closes #N` keyword in the PR body

### T17 — Special characters in feedback (dual parser)

The workflow has **two parser paths** — the shell parser in kody.yml (uses `grep -oP`, `awk`) and the TypeScript parser in `src/ci/parse-inputs.ts`. Both must handle special characters correctly.

1. Comment on a PR: `@kody fix\nPlease use "quotes" and handle edge-cases with $(dollar) signs`
2. Pipeline should complete without shell injection errors
3. Verify in **parse job** logs: feedback was extracted without shell errors
4. Verify in **orchestrate job** logs: feedback text appears in the FEEDBACK env var and build stage logs (properly escaped)
5. FAIL if: Workflow errors with "bad substitution", command execution, or similar shell errors

**Known risk:** The shell parser at kody.yml line 102 uses `BODY="${{ github.event.comment.body }}"` — direct interpolation. The HEREDOC fix only applies to the FEEDBACK output. Monitor for breakage here.

### T18 — Force-with-lease retry

This exercises the fix from `b73687d`:

1. Use `@kody rerun --from build` on an issue that already has a pushed branch
2. Check logs for push behavior:
   - If fast-forward succeeds: normal push (no retry needed)
   - If non-fast-forward: look for "Push rejected (non-fast-forward), retrying with --force-with-lease"
3. Either outcome is acceptable — the test validates the retry mechanism exists

### T23 — Issue attachments and metadata enrichment

This tests that Kody downloads image attachments from GitHub issues and enriches task.md with labels and discussion comments.

**Setup:**

1. Create an issue with an image in the body and at least one label:
   ```bash
   # First, upload an image to GitHub by creating an issue with an image via the web UI,
   # or use a known GitHub-hosted asset URL from the tester repo.
   # The issue body must contain a markdown image link like:
   # ![mockup](https://github.com/user-attachments/assets/<uuid>/<filename>.png)
   gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
     --title "[test-suite] Issue with image attachment" \
     --body "## Task\nAdd a footer component.\n\n## Design\n![mockup](https://github.com/user-attachments/assets/test-uuid/footer-design.png)\n\nSee the attached mockup for layout." \
     --label "test-suite,ui"
   ```
2. Add a comment on the issue before triggering Kody (to test discussion capture):
   ```bash
   gh issue comment <n> --repo aharonyaircohen/Kody-Engine-Tester --body "Make sure the footer is responsive"
   ```
3. Trigger: `gh issue comment <n> --repo aharonyaircohen/Kody-Engine-Tester --body "@kody"`

**Verification:**

1. Check workflow run logs for attachment download:
   ```bash
   gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "Downloaded attachment\|attachments/"
   ```
2. Check logs for label and comment enrichment:
   ```bash
   gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "Labels:\|Discussion"
   ```
3. If the image URL is unreachable (404), verify graceful fallback: original URL preserved in task.md, warning logged, pipeline continues
4. PASS: Logs show "Downloaded attachment:" and task.md contains `attachments/` local paths, **Labels:** line, and **Discussion** section
5. FAIL: Image URLs remain as remote URLs without download attempt, or labels/comments missing from task.md

**Note:** If the tester repo is private, the `gh api` download must use authentication. Verify the workflow has `GH_TOKEN` or `GH_PAT` available for authenticated asset fetching.

### T27 — Decompose: config disabled

This tests that `decompose.enabled: false` in kody.config.json causes immediate fallback.

**Setup:**

1. Temporarily set `decompose.enabled: false` in the tester repo's `kody.config.json`:
   ```bash
   # Read current config, add decompose.enabled: false, push
   gh api repos/aharonyaircohen/Kody-Engine-Tester/contents/kody.config.json | jq -r '.content' | base64 -d > /tmp/kody-config.json
   # Edit to add "decompose": { "enabled": false }
   # Push the change
   ```
2. Create an issue and comment `@kody decompose`

**Verification:**
```bash
gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "decompose disabled\|falling back"
```
- Expected: Logs show "decompose disabled in config — falling back to normal pipeline"
- Pipeline completes via normal `runPipeline()` path
- No decompose.json or decompose-state.json artifacts created

**Mandatory cleanup:** Revert the config change after the test:
```bash
# Remove the decompose.enabled: false setting and push
```

- PASS: Immediate fallback, no decompose attempt
- FAIL: Decompose runs despite config disable

### T30 — Decompose: sub-task failure triggers fallback

This tests the conservative failure strategy where any sub-task failure aborts all and falls back to normal pipeline.

**Setup:**

Create a complex issue where one sub-task is likely to fail (e.g., a task referencing a non-existent dependency or file that will cause build errors):
```
Title: [test-suite] Decompose: sub-task failure fallback
Body:
Implement a caching system:
1. Add Redis cache adapter in src/cache/redisAdapter.ts (requires 'ioredis' package — NOT installed)
2. Add in-memory cache adapter in src/cache/memoryAdapter.ts with TTL support
3. Add cache manager in src/cache/cacheManager.ts that selects adapter
4. Add cache middleware in src/middleware/cacheMiddleware.ts
```

The Redis adapter sub-task should fail because `ioredis` isn't installed. If decompose splits it into sub-tasks, one will fail.

**Verification:**
```bash
gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "sub-task.*failed\|cleanup\|fallback\|Delegating to normal pipeline"
```
- Expected: Sub-task failure detected, worktrees cleaned up, falls back to `runPipeline()`
- Normal pipeline may still succeed (single agent can handle the missing dependency better)
- OR: If decompose scores this below threshold, it falls back without attempting parallel build (also acceptable)

- PASS: Failure detected, cleanup executed, fallback to normal pipeline
- FAIL: Partial merge of failed sub-tasks, or worktrees left behind, or pipeline hangs

### T33 — Lifecycle label progression

This validates that labels update correctly through each pipeline stage. Can piggyback on any T01/T02 run or use a dedicated issue.

1. Create an issue and trigger `@kody`
2. Monitor labels during the run (poll every 30s):
   ```bash
   while true; do
     gh issue view <n> --repo aharonyaircohen/Kody-Engine-Tester --json labels -q '[.labels[].name | select(startswith("kody:"))] | join(", ")'
     sleep 30
   done
   ```
3. **Verification:**
   - Labels should progress through: `kody:planning` → `kody:building` → `kody:verifying` → `kody:review` → `kody:done`
   - At each stage transition, the previous stage label is removed and the new one is added
   - Complexity label persists: `kody:low`, `kody:medium`, or `kody:high` stays throughout
   - Final state: only `kody:done` + complexity label remain
4. Check logs for label operations:
   ```bash
   gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "label"
   ```
- PASS: Labels progress in order, old labels removed, complexity label persists
- FAIL: Labels accumulate (not removed), or stages skipped in label progression

### T34 — Token ROI in retrospective

This validates that pipeline retrospectives include per-stage token counts for ROI tracking.

1. Use any completed pipeline run (T01/T02 or dedicated)
2. Check the observer log for token stats:
   ```bash
   # Get the latest entry from observer-log.jsonl in the tester repo
   gh api repos/aharonyaircohen/Kody-Engine-Tester/contents/.kody/memory/observer-log.jsonl | \
     jq -r '.content' | base64 -d | tail -1 | jq '.tokenStats'
   ```
3. **Verification:**
   - `tokenStats` field exists in the retrospective entry
   - `tokenStats.totalPromptTokens` is a positive number
   - `tokenStats.perStage` has entries for each executed stage (taskify, plan, build, etc.)
   - `tokenStats.memoryTokens` reflects project memory size (0 if no memory)
- PASS: tokenStats present with per-stage breakdown
- FAIL: tokenStats missing or null, or perStage is empty

### T35 — Auto-learn memory committed in PR

This validates that auto-learn runs before the ship stage, so learned conventions are committed in the PR branch (not lost).

1. Use any successful pipeline run that creates a PR
2. Check the PR diff for memory files:
   ```bash
   gh pr diff <n> --repo aharonyaircohen/Kody-Engine-Tester | grep "^diff --git.*\.kody/memory"
   ```
3. **Verification:**
   - `.kody/memory/` files appear in the PR diff (committed by ship stage)
   - Check run logs for auto-learn execution order:
     ```bash
     gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "auto-learn\|learning\|conventions"
     ```
   - Auto-learn should run BEFORE "Committed task artifacts" (ship stage)
- PASS: Memory files in PR diff, auto-learn runs before ship
- FAIL: No memory files in PR, or auto-learn runs after ship (memory lost)

### T36 — Engine-managed dev server lifecycle

This validates that the engine starts and stops the dev server for UI tasks, rather than leaving it to the Claude agent.

**Precondition:** Tester repo must have `devServer` configured in `kody.config.json`:
```bash
gh api repos/aharonyaircohen/Kody-Engine-Tester/contents/kody.config.json | jq -r '.content' | base64 -d | jq '.devServer'
```

1. Create a UI-focused issue (e.g., "Add a search bar component to the header")
2. Comment `@kody`
3. **Verification:**
   ```bash
   gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "dev server\|KODY_DEV_SERVER"
   ```
   - Expected log lines:
     - `Starting dev server: <command>` (engine starts it)
     - `Dev server ready at <url>` OR `Dev server not ready` (status reported)
     - `KODY_DEV_SERVER_READY=true` or `KODY_DEV_SERVER_READY=false` set as env var
     - `Dev server stopped` (engine stops it after stage)
   - The agent should NOT start its own dev server (no `nohup pnpm dev` in agent output)
- PASS: Engine manages dev server lifecycle, env vars set correctly
- FAIL: Agent starts its own dev server, or engine doesn't stop it, or env vars missing

### T37 — Hotfix: fast-track pipeline

This tests the `@kody hotfix` command which runs a compressed pipeline: build → verify (typecheck+lint only, no tests) → ship, skipping taskify/plan/review/review-fix.

**Setup:**

1. Create a simple issue that describes an urgent fix:
   ```bash
   gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
     --title "[test-suite] Hotfix: fix broken export in utils" \
     --body "The default export in src/utils/helpers.ts is missing. Add \`export default\` to the main function. This is an urgent production fix."
   ```
2. Trigger: `gh issue comment <n> --repo aharonyaircohen/Kody-Engine-Tester --body "@kody hotfix"`

**Verification:**

1. Check parse job output:
   ```bash
   gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep "mode=hotfix"
   ```
   - Mode is `hotfix`, task-id matches `hotfix-<issue>-<timestamp>`

2. Check stage execution — only build, verify, ship should run:
   ```bash
   gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "stage\|Complexity"
   ```
   - Expected: `⚡ Complexity: hotfix — skipping taskify, plan, review, review-fix`
   - Stages executed: build → verify → ship (3 stages only)
   - Stages NOT executed: taskify, plan, review, review-fix

3. Check verify skips tests:
   ```bash
   gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "Running typecheck\|Running test\|Running lint"
   ```
   - Expected: `Running typecheck:` and optionally `Running lint:` appear
   - `Running test:` should NOT appear (tests skipped for fast-track)

4. Check PR creation:
   ```bash
   gh pr list --repo aharonyaircohen/Kody-Engine-Tester --state open --json number,title,labels
   ```
   - PR created and linked to the issue

- PASS: Pipeline completes with only build→verify→ship, tests skipped, PR created
- FAIL: Taskify/plan/review stages execute, or tests run during verify, or no PR created

### T38 — Revert: explicit PR target

This tests `@kody revert #<PR>` which deterministically reverts a merged PR without LLM assistance.

**Precondition:** A merged PR from Phase 4 (T01 or T02) must exist. Record its PR number.

**Setup:**

1. Create an issue for the revert:
   ```bash
   gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
     --title "[test-suite] Revert: undo PR #<N>" \
     --body "Revert the changes from PR #<N> due to a regression."
   ```
2. Trigger: `gh issue comment <n> --repo aharonyaircohen/Kody-Engine-Tester --body "@kody revert #<PR_NUMBER>"`

**Verification:**

1. Check parse job output:
   ```bash
   gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep "mode=revert\|revert_target="
   ```
   - Mode is `revert`, revert_target is the PR number

2. Check revert execution:
   ```bash
   gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "revert\|merge commit\|verify"
   ```
   - Expected logs: PR lookup, merge commit SHA found, `git revert` executed, verify ran (full: typecheck+lint+tests)

3. Check PR creation:
   ```bash
   gh pr list --repo aharonyaircohen/Kody-Engine-Tester --state open --json number,title,labels
   ```
   - Revert PR created with title `revert: <original title> (#<N>)`
   - PR has `revert` label
   - PR body contains original PR reference and verify results

4. Check issue comment:
   ```bash
   gh issue view <n> --repo aharonyaircohen/Kody-Engine-Tester --json comments --jq '.comments[-1].body'
   ```
   - Comment links to the revert PR

- PASS: Merged PR reverted, full verify ran, revert PR created with correct title/label/body
- FAIL: Revert fails (conflict, PR not found), or verify not run, or PR missing metadata

### T39 — Revert: auto-resolve from issue

This tests `@kody revert` (no explicit target) which finds the linked merged PR by branch naming convention.

**Precondition:** An issue whose PR was merged in Phase 4. The PR branch must follow the `<issue>-<slug>` convention.

**Setup:**

1. Comment on a Phase 4 issue whose PR was already merged:
   ```bash
   gh issue comment <n> --repo aharonyaircohen/Kody-Engine-Tester --body "@kody revert"
   ```

**Verification:**

1. Check that the engine resolved the PR automatically:
   ```bash
   gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "searching for merged PR\|Found linked PR"
   ```
   - Expected: `No target specified, searching for merged PR linked to issue #<n>...` then `Found linked PR #<N>: <title>`

2. Same verification as T38 — revert PR created, full verify, correct metadata

- PASS: Engine auto-resolves the merged PR from issue number, revert succeeds
- FAIL: Engine can't find the linked PR, or uses wrong PR, or revert fails

### T40 — Release: dry-run

This tests `@kody release --dry-run` which analyzes conventional commits and previews the release without making changes.

**Precondition:** The tester repo must have at least one conventional commit since the last tag (or no tags at all). The repo should have a `package.json` with a `version` field.

**Setup:**

1. Trigger on any issue:
   ```bash
   gh issue comment <n> --repo aharonyaircohen/Kody-Engine-Tester --body "@kody release --dry-run"
   ```

**Verification:**

1. Check parse job output:
   ```bash
   gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep "mode=release\|dry_run="
   ```
   - Mode is `release`, dry_run is `true`

2. Check release analysis in logs:
   ```bash
   gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "bump\|version\|changelog\|dry-run\|conventional"
   ```
   - Expected: Logs show commit parsing, determined bump type (patch/minor/major), calculated next version
   - `[dry-run]` prefix on all actions
   - No PR created, no version files modified, no tags created

3. Verify no side effects:
   ```bash
   gh pr list --repo aharonyaircohen/Kody-Engine-Tester --state open --head "release/" --json number
   ```
   - No release PR created

- PASS: Commits analyzed, bump determined, changelog previewed, no side effects
- FAIL: Actual changes made despite --dry-run, or commit parsing fails

### T41 — Release: create release PR

This tests `@kody release` which bumps version, generates changelog, and creates a release PR.

**Precondition:** Same as T40. Additionally, the release config should be either absent (defaults used) or configured in `kody.config.json` under `release`.

**Setup:**

1. Ensure there are conventional commits since the last tag (if T01/T02 PRs were merged, their `feat:` / `fix:` commits qualify)
2. Trigger on any issue:
   ```bash
   gh issue comment <n> --repo aharonyaircohen/Kody-Engine-Tester --body "@kody release"
   ```

**Verification:**

1. Check pre-release checks passed:
   ```bash
   gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "pre-release\|CI green\|blocking"
   ```
   - CI status checked on default branch
   - No blocking draft PRs (or handled gracefully)

2. Check version bump:
   ```bash
   gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log | grep -i "bump\|version.*→"
   ```
   - Version bumped correctly based on conventional commits (feat→minor, fix→patch, breaking→major)

3. Check release PR created:
   ```bash
   gh pr list --repo aharonyaircohen/Kody-Engine-Tester --state open --head "release/" --json number,title,labels,body
   ```
   - PR exists with branch `release/v<version>`
   - Title contains version number
   - PR has `release` label
   - Body contains generated changelog grouped by type (Features, Bug Fixes, etc.)

4. Check package.json updated in PR:
   ```bash
   gh pr diff <n> --repo aharonyaircohen/Kody-Engine-Tester | grep -A2 '"version"'
   ```
   - Version field bumped to the new version

- PASS: Version bumped, changelog generated, release PR created with correct labels and content
- FAIL: Wrong bump type, missing changelog sections, no PR, or PR targets wrong branch

**Mandatory cleanup:** After verification, close the release PR without merging (or merge if desired — but then T40/T41 can't rerun without new commits):
```bash
gh pr close <n> --repo aharonyaircohen/Kody-Engine-Tester --delete-branch
```

---

## Fix-Retry Loop

When any test fails:

1. Fetch logs: `gh run view <id> --repo aharonyaircohen/Kody-Engine-Tester --log-failed`
2. Diagnose: Is it a pipeline bug, task issue, infrastructure, or config problem?
3. If **pipeline bug**:
   a. Fix in Kody-Engine-Lite
   b. Add/update tests
   c. Run `pnpm typecheck && pnpm test` — all must pass
   d. Bump version: `npm version patch --no-git-tag-version`
   e. Build + publish: `pnpm build && npm publish --access public`
   f. Commit + push: `git add . && git commit -m "fix: <desc>" && git push`
   g. Retry the same command on the same issue (don't create a new issue)
4. If **infrastructure**: Wait 1 minute, retry (max 2 retries)
5. If **task issue**: Close issue, recreate with better description, restart test

**Max retries per test:** 3 fix attempts. If still failing after 3 fixes, mark as `MANUAL_REVIEW` and move on.

**Version tracking:** Record every version bump. Example:

```
T01: started at 0.1.81
  - attempt 1: failed (taskify timeout) -> fixed in 0.1.82
  - attempt 2: passed at 0.1.82
```

---

## Phase 4: Cleanup

After all tests pass (or are marked `MANUAL_REVIEW`):

1. **T16 pre-merge check:** Before merging, verify all [test-suite] issues are still OPEN
2. Merge all test PRs:
   `gh pr merge <n> --repo aharonyaircohen/Kody-Engine-Tester --merge --delete-branch`
3. **T16 post-merge check:** After merging, verify issues auto-closed via `Closes #N`:
   ```bash
   gh issue list --repo aharonyaircohen/Kody-Engine-Tester --state closed --label "test-suite" --json number,title
   ```
4. Close any remaining test issues: Close all `[test-suite]` issues not auto-closed
5. **T08 conflict cleanup:** Verify and revert conflict commit from base branch:
   ```bash
   gh api repos/aharonyaircohen/Kody-Engine-Tester/commits?sha=<base>&per_page=5
   # Confirm the "test: create conflict for T08" commit is reverted
   ```
6. Delete leftover branches: Any `[test-suite]` branches not cleaned up by PR merge

---

## Phase 5: Reflect

### 5a. Verify Memory Updates

Check that the engine's learning systems produced output:

1. **Auto-learn**: Check `.kody/memory/` in the tester repo for new convention files:
   ```bash
   gh api repos/aharonyaircohen/Kody-Engine-Tester/contents/.kody/memory 2>/dev/null | jq '.[].name'
   ```
2. **Retrospectives**: Check `.kody/tasks/*/retrospective.md` for each completed run (download artifacts from workflow runs)
3. **Flag gaps**: If any successful run didn't produce learnings, note it as a potential bug

### 5b. Read All Memory

Scan and synthesize:

1. Engine memory: `ls .kody/memory/` in the Kody-Engine-Lite repo
2. Tester memory: `gh api repos/aharonyaircohen/Kody-Engine-Tester/contents/.kody/memory`
3. Retrospective files from test run artifacts
4. Claude Code project memories (check the memory directory for this project)

### 5c. Summarize

Produce a final report with these sections:

**Test Results Matrix:**

| Test | Command | Flags | Complexity | Result | Retries | Version | PR |
|------|---------|-------|------------|--------|---------|---------|-----|
| T01 | @kody | — | low | PASS | 0 | 0.1.81 | #N |
| ... | ... | ... | ... | ... | ... | ... | ... |

**Fixes Made:**

| Version | What broke | Root cause | Fix |
|---------|-----------|------------|-----|
| 0.1.82 | T01 taskify timeout | ... | ... |

**Memory Delta:**
- New conventions learned
- New patterns discovered
- Retrospective insights

**Enhancement Recommendations (prioritized by impact):**

| Priority | Enhancement | Why | Effort |
|----------|-------------|-----|--------|
| P0 | ... | Failed in N tests | Low |
| P1 | ... | Retrospective pattern | Medium |

### 5d. Save Conclusions

Write a test-suite summary to project memory. Include: date, engine version range, pass/fail counts, fixes made, top recommendations. This enables regression tracking across suite runs.

---

## Verification Checklist

Every test must pass both functional and quality checks:

### Functional checks (does it work?)

- [ ] Workflow triggered and completed (success/failure as expected)
- [ ] Issue comments match expected pattern
- [ ] Labels set correctly (`kody:done`, `kody:waiting`, `kody:failed`, `kody:low`/`medium`/`high`)
- [ ] PR created/updated when expected
- [ ] No PR created when not expected (dry-run)
- [ ] fix-ci auto-trigger posts comment and loop guard prevents re-trigger (T19)
- [ ] Status command prints state without executing stages (T20)

### Quality checks (does it work correctly?)

- [ ] Bare `@kody` and explicit `@kody full` both resolve to "full" mode (T01 vs T02)
- [ ] PR title uses issue title with type prefix — not LLM-generated verbose title (T01, T02, T05, T15)
- [ ] PR body contains `Closes #<issue_number>` (T16)
- [ ] Issue remains OPEN after PR creation — not prematurely closed (T16)
- [ ] Issue auto-closes after PR merge via `Closes #N` keyword (T16, Phase 4)
- [ ] Review findings reference PR diff files — not random repo files (T06, T07b)
- [ ] Review uses correct diff command — `git diff origin/<base>...HEAD`, not bare `git diff` (T06, T07b)
- [ ] Fix pushes to same PR — not a new PR (T07)
- [ ] Re-review after fix produces different findings — not a copy of the original review (T07b)
- [ ] Complexity override logged as "override" — not "auto-detected" (T10)
- [ ] Complexity env var propagated: `COMPLEXITY=` visible in orchestrate job (T10)
- [ ] Feedback text logged in build stage — visible in CI logs (T11)
- [ ] Rerun skips correct stages — only stages from `--from` onward execute (T09, T12)
- [ ] Resolve merges base branch — PR branch has the conflict commit merged in (T08)
- [ ] State bypass works — rerun/resolve not blocked by completed/running state (T09, T13)
- [ ] MCP devServer is configured in tester repo before T14 runs (T14 precondition)
- [ ] MCP auto-inject for UI tasks — Playwright MCP present when hasUI=true (T14)
- [ ] Special chars in feedback don't cause shell injection in either parser path (T17)
- [ ] Force-with-lease retry on non-fast-forward push (T18)
- [ ] fix-ci loop guard: second auto-trigger suppressed within 24h (T19)
- [ ] fix-ci bot commit guard: no auto-trigger if last commit from bot (T19)
- [ ] Every taskify sub-issue has exactly one priority label — `priority:high`, `priority:medium`, or `priority:low` (T21)
- [ ] Every taskify sub-issue body contains `## Test Strategy`, `## Context`, `## Acceptance Criteria` (T21)
- [ ] Taskify files issues in dependency order — issue numbers reflect topological sort (T21)
- [ ] Project memory content appears in taskify stage logs — no vacuum decomposition (T22)
- [ ] File tree appears in taskify stage logs — `git ls-files` context injected (T22)
- [ ] Image attachments downloaded to `attachments/` dir — logs show "Downloaded attachment:" (T23)
- [ ] task.md contains local `attachments/` paths, not remote GitHub asset URLs (T23)
- [ ] task.md includes **Labels:** line with issue labels (T23)
- [ ] task.md includes **Discussion** section with pre-trigger comments (T23)
- [ ] Graceful fallback on attachment download failure — original URL preserved, pipeline continues (T23)
- [ ] No raw `{{ }}` template tokens in taskify logs — all template blocks resolved (T22)
- [ ] Decompose fallback: simple task (score < 6) delegates to runPipeline, PR created normally (T24)
- [ ] Decompose full flow: 2+ sub-tasks built in parallel worktrees, merged, verified, reviewed, shipped (T25)
- [ ] decompose-state.json saved with sub-task branches, outcomes, and compose results (T25, T26)
- [ ] PR body contains "Decomposed Implementation" section listing sub-tasks with file counts (T25, T28)
- [ ] --no-compose stops after parallel build — no merge/verify/review/ship phases (T26)
- [ ] Compose reads decompose-state.json and merges sub-task branches sequentially (T28)
- [ ] Compose is re-runnable — skips merge on retry, retries from verify (T29)
- [ ] Sub-task failure triggers worktree cleanup + fallback to normal pipeline (T30)
- [ ] decompose.enabled: false skips decompose entirely, immediate fallback (T27)
- [ ] Worktrees cleaned up after successful merge or after failure (T25, T28, T30)
- [ ] Sub-tasks have exclusive file ownership — no file overlap in worktree diffs (T25)
- [ ] T27 config cleanup: decompose.enabled reverted after test (T27)
- [ ] Bootstrap generates memory, step files, tools.yml, and labels (T31)
- [ ] Bootstrap extends existing files instead of overwriting (T31)
- [ ] Watch plugins execute in dry-run without posting to GitHub (T32)
- [ ] Lifecycle labels progress in order: planning→building→verifying→review→done (T33)
- [ ] Previous stage label removed when new stage label added (T33)
- [ ] Complexity label persists alongside stage labels (T33)
- [ ] Retrospective tokenStats includes totalPromptTokens and perStage breakdown (T34)
- [ ] Auto-learn runs before ship — memory files appear in PR diff (T35)
- [ ] Engine starts dev server for UI tasks — KODY_DEV_SERVER_READY in logs (T36)
- [ ] Engine stops dev server after stage completes — "Dev server stopped" in logs (T36)
- [ ] Agent does NOT start its own dev server when engine manages it (T36)
- [ ] Hotfix skips taskify/plan/review/review-fix — only build, verify, ship execute (T37)
- [ ] Hotfix verify skips tests — only typecheck and lint run, no testUnit (T37)
- [ ] Revert with explicit `#<PR>` target finds the merged PR and its merge commit (T38)
- [ ] Revert runs full verify (typecheck+lint+tests) — not the hotfix reduced verify (T38)
- [ ] Revert PR title follows `revert: <original title> (#N)` format (T38)
- [ ] Revert PR has `revert` label applied (T38)
- [ ] Revert without target auto-resolves PR from issue branch naming convention (T39)
- [ ] Revert handles squash-merged PRs (retries without -m 1 on merge commit failure) (T38)
- [ ] Release dry-run produces no side effects — no PR, no tags, no file changes (T40)
- [ ] Release dry-run logs show commit analysis, bump type, and version preview (T40)
- [ ] Release creates PR on `release/v<version>` branch targeting default branch (T41)
- [ ] Release PR has `release` label applied (T41)
- [ ] Release changelog groups commits by type (Features, Bug Fixes, etc.) (T41)
- [ ] Release version bump matches conventional commit analysis (feat→minor, fix→patch) (T41)
- [ ] Release pre-release checks verify CI green on default branch (T41)

---

## Execution Rules

1. **One test at a time within a phase** (except Phase 1 which runs in parallel)
2. **Always verify via gh CLI** — don't assume success, check issue comments and labels
3. **Never skip a failing test** — fix or mark as `MANUAL_REVIEW`
4. **Update docs after any engine fix** (README, CLI.md, schema, kody-manager skill, memory)
5. **Commit all fixes with tests** — no untested changes
6. **Record everything** — the final report should be complete enough to reproduce the entire run
7. **Verify outputs, not just status** — a "success" workflow that reviews the wrong PR is a critical bug
8. **Budget cap:** Stop after 5 cumulative fix-retry version bumps across all tests. If fixes are cascading, the engine needs broader debugging — pause, report findings, and ask for guidance rather than continuing to fix per-test.
9. **Phase timeout:** If any single phase takes more than 3 hours wall-clock, pause and report what's complete. Resume after review.
10. **Cascade abort:** If 3+ tests in the same phase fail with the same root cause, fix once and batch-retry all affected tests rather than fixing per-test.

## Getting Started

Begin by running:

```bash
gh issue list --repo aharonyaircohen/Kody-Engine-Tester --state open --label "test-suite" 2>/dev/null
```

If previous test-suite issues exist, clean them up first. Then start Phase 1.
