---
description: Complete test suite runner for Kody Engine Lite — 7 consolidated E2E tests covering every CLI command and flag
---

You are the Kody Complete Test Suite runner. Your job is to systematically run every CLI command and flag combination documented in docs/CLI.md as live end-to-end tests on the https://github.com/aharonyaircohen/Kody-Engine-Tester repo, fix any failures in the engine, and produce a comprehensive report with enhancement recommendations.

## Overview

The suite runs in 4 phases across **7 GitHub issues** (was 41). Every original test case is still executed and verified — no coverage is lost.

```
Phase 1: T01 — Core Pipeline (all @kody variants, 1 issue)
Phase 2: T02 — Dependent Commands (chained on 1 issue)
Phase 3: T03–T07 — Complex Features (parallel + chained)
Phase 4: Cleanup + Reflect
```

**How chaining works:** Create an issue → comment a command → wait for the workflow to complete → comment the next command on the same issue. No new issues needed for sequential steps.

---

## Phase 1: T01 — Core Pipeline

**1 GitHub issue, 1 PR.**

All `@kody` variants are triggered as sequential comments on the same issue. Each variant waits for the prior workflow to complete before the next is triggered.

**Create issue:**
```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T01: Core pipeline — all variants" \
  --body "Testing all @kody command variants in sequence."
```

### Step 1.1 — `@kody` (bare, LOW complexity)

Comment: `@kody`

### Step 1.2 — `@kody full` (explicit MEDIUM)

Comment (after 1.1 completes): `@kody full`

### Step 1.3 — `@kody --complexity low`

Comment (after 1.2 completes): `@kody --complexity low`

### Step 1.4 — `@kody --complexity high` (risk gate)

Comment (after 1.3 completes): `@kody --complexity high`

Create a task clearly spanning multiple systems, e.g.:
> "Redesign auth: replace session-based auth with JWT, migrate user schema, add RBAC with admin/editor/viewer roles, update all API routes"

**Verification:** Pipeline pauses at the risk gate. T05 (approve) is tested in T02.

**Contingency if not paused:** Recreate with an unambiguously HIGH task, or comment `@kody full --complexity high`.

### Step 1.5 — `@kody --dry-run`

Comment (after 1.4 completes): `@kody --dry-run`

### Step 1.6 — `@kody --feedback`

Comment (after 1.5 completes): `@kody --feedback "Use functional style"`

### Post-run checks (verify after any completed run)

Run all of these after the pipeline completes:

**T14 — MCP auto-inject:** If the task has a UI component, verify `task.json` has `hasUI: true` and logs show Playwright MCP injected. If not a UI task, skip — not a failure.

**T15 — PR title:**
```bash
gh pr view <n> --json title --repo aharonyaircohen/Kody-Engine-Tester
```
- Title is `feat: <issue title>`, NOT an LLM-generated verbose summary.

**T16 — Issue lifecycle:**
```bash
gh pr view <n> --json body --repo aharonyaircohen/Kody-Engine-Tester | jq -r '.body' | grep "Closes #"
gh issue view <n> --json state --repo aharonyaircohen/Kody-Engine-Tester | jq -r '.state'
```
- Issue remains OPEN after PR created. PR body contains `Closes #<issue_number>`. Issue auto-closes on merge (Phase 4).

**T33 — Lifecycle labels:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "label"
```
- Labels progress: planning→building→verifying→review→done. Previous stage label removed when new added. Complexity label persists.

**T34 — Token ROI:**
```bash
gh api repos/aharonyaircohen/Kody-Engine-Tester/contents/.kody/memory/observer-log.jsonl 2>/dev/null | \
  jq -r '.content' | base64 -d | tail -1 | jq '.tokenStats'
```
- `tokenStats.totalPromptTokens` is positive. `tokenStats.perStage` has entries for each executed stage.

**T35 — Auto-learn:**
```bash
gh pr diff <n> --repo aharonyaircohen/Kody-Engine-Tester | grep "^diff --git.*\.kody/memory"
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "auto-learn"
```
- Memory files appear in PR diff. Auto-learn runs before ship (check logs for "auto-learn" before "Committed task artifacts").

**T36 — Dev server (if UI task):**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "dev server\|KODY_DEV_SERVER"
```
- `Starting dev server:`, `KODY_DEV_SERVER_READY=`, `Dev server stopped` in logs. Agent did NOT start its own dev server.

---

## Phase 2: T02 — Dependent Commands

**1 GitHub issue, uses T01's PR. Chains all commands on same issue.**

Create issue:
```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T02: Dependent commands chain" \
  --body "Testing approve, review, fix, resolve, rerun, status — all chained on T01's PR."
```

### Step 2.1 — `@kody approve` (conditional)

If T01 step 1.4 (HIGH complexity) paused at the risk gate, comment: `@kody approve`

Otherwise skip this step.

### Step 2.2 — `@kody review`

Comment: `@kody review` on T01's PR.

**Verification:** Review comment posted. Findings reference files from PR diff. Check logs for `git diff origin/<base>...HEAD` (not bare `git diff`).

### Step 2.3 — `@kody fix`

Comment: `@kody fix` on the same PR.

**Verification:** Fix pushed to the SAME PR (not a new PR). Commit message references the fix.

### Step 2.4 — `@kody review` (re-review)

Comment: `@kody review` on the same PR again.

**Verification:** New review comment posted (not a duplicate of 2.2). Findings differ from 2.2. If verdict was FAIL in 2.2, check if it changed.

### Step 2.5 — `@kody resolve`

**Conflict setup before commenting:**
```bash
# Find T01's PR base branch
PR_NUM=$(gh pr list --repo aharonyaircohen/Kody-Engine-Tester --state open --search "test-suite" --json number -q '.[0].number')
BASE=$(gh pr view $PR_NUM --json baseRefName -q '.baseRefName')

# Create conflict on base branch
git fetch origin $BASE
git checkout $BASE
# Edit the same file the PR modified (same lines)
git commit -m "test: create conflict for T02"
git push origin $BASE
```

Comment: `@kody resolve` on T01's PR.

**Verification:** PR branch merged with base changes. Resolve comment confirms success.

**Cleanup (Phase 4):** Revert the conflict commit from the base branch after verification.

### Step 2.6 — `@kody rerun --from build`

Comment: `@kody rerun --from build` on T01's issue.

**T12 verification:** Logs show `Resuming from: build`. taskify and plan NOT executed.

**T13 verification:** Pipeline re-executes (not blocked by "already completed" state lock).

### Step 2.7 — `@kody status`

Comment: `@kody status` on T01's issue.

**Verification:** Pipeline state printed from status.json. No stages executed.

---

## Phase 3: Complex Features

### T03 — Decompose: all scenarios

**1 GitHub issue.** Tests all decompose variants sequentially on the same issue.

Create issue:
```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T03: Decompose — all variants" \
  --body "Testing decompose fallback, split, --no-compose, compose retry, config disabled, sub-task failure."
```

#### Step 3.1 — Decompose: simple task fallback

Comment (T03 issue): `@kody decompose`

Task description for this step:
> "Add a string capitalize utility function in src/utils/strings.ts with tests"

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "complexity_score\|not decomposable\|falling back"
```
- `complexity_score < 6` → fallback to `runPipeline()`, PR created normally.

#### Step 3.2 — Decompose: complex task full split

Comment (T03 issue): `@kody decompose`

Task description for this step:
> "Add a complete notification system: notification model in src/models/, notification service in src/services/, notification API routes in src/routes/, notification utility helpers in src/utils/, unit tests in src/__tests__/"

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "decomposable\|complexity_score\|sub-task\|parallel"
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "merge\|verify\|review\|ship"
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "worktree removed\|cleaned"
```
- `complexity_score ≥ 6`, `decomposable: true`, 2+ sub-tasks.
- Parallel worktree builds, then merge, verify, review, ship.
- "Decomposed Implementation" section in PR body.
- `decompose-state.json` saved.
- Worktrees cleaned up.

#### Step 3.3 — Decompose: --no-compose

Comment (T03 issue): `@kody decompose --no-compose`

Task description: Same as step 3.2 (complex notification system).

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "no-compose\|decompose-state"
gh run run list --repo aharonyaircohen/Kody-Engine-Tester --workflow=kody.yml --limit 5
```
- Parallel builds complete. `decompose-state.json` saved. NO merge/verify/review/ship. No PR created.
- Get the `task-id` from logs for step 3.4.

#### Step 3.4 — Compose: re-runnable

Comment (T03 issue): `@kody compose --task-id <task-id-from-3.3>`

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "merge.*skip\|compose phase"
```
- Merge skipped. Verify+review re-execute. Ship completes. PR created.

#### Step 3.5 — Compose: retry after failure

Force a compose retry (simulate failure):
1. Find `decompose-state.json` in the task directory.
2. Edit to set `compose.verify: "failed"` and remove the `compose.ship` field.
3. Comment (T03 issue): `@kody compose --task-id <task-id>`

**Verification:** Merge skipped again. Verify+review retried. Ship completes.

#### Step 3.6a — Decompose: config disabled

**Setup:**
1. Add `decompose.enabled: false` to `kody.config.json` in the tester repo via API.
2. Comment (T03 issue): `@kody decompose`
3. **After verification:** Revert the config change.

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "decompose disabled\|falling back"
```
- Immediate fallback to normal pipeline. No decompose artifacts created.

#### Step 3.6b — Decompose: sub-task failure

Comment (T03 issue): `@kody decompose`

Task description:
> "Implement a caching system: Redis adapter in src/cache/redisAdapter.ts (requires 'ioredis' — NOT installed), in-memory adapter in src/cache/memoryAdapter.ts, cache manager in src/cache/cacheManager.ts, cache middleware in src/middleware/cacheMiddleware.ts"

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "sub-task.*failed\|cleanup\|fallback"
```
- Sub-task failure detected, worktrees cleaned up, fallback to `runPipeline()`.

---

### T04 — fix-ci + taskify

**1 GitHub issue, uses T01's PR. Runs in parallel with T03.**

Create issue:
```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T04: fix-ci + taskify" \
  --body "Testing fix-ci auto-trigger, loop guard, and taskify with PRD file."
```

#### PRD file setup (for steps 4.3 and 4.4)

```bash
gh api repos/aharonyaircohen/Kody-Engine-Tester/contents/docs/test-prd.md \
  --method PUT \
  --field message="test: add PRD for T04" \
  --field content="$(echo '# Auth Feature
Add JWT authentication.

## Tasks
1. Add User model with password hash field
2. Add /login and /register endpoints (depends on User model)
3. Add auth middleware to protect existing routes (depends on endpoints)' | base64)"
```

#### Step 4.1 — Push a breaking commit to T01's PR

```bash
PR_NUM=$(gh pr list --repo aharonyaircohen/Kody-Engine-Tester --state open --search "test-suite.*Core" --json number -q '.[0].number')
BRANCH=$(gh pr view $PR_NUM --json headRefName -q '.headRefName')
git fetch origin $BRANCH
git checkout $BRANCH
# Introduce a type error in a test file
git commit -m "test: break type check for T04"
git push origin $BRANCH
```

Wait for CI to fail.

#### Step 4.2 — `@kody fix-ci`

Comment (T04 issue): `@kody fix-ci` (or it will be auto-posted by the workflow if `fix-ci-trigger` is configured).

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "fix-ci\|already commented"
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "loop guard\|bot commit"
```
- `@kody fix-ci` pipeline runs, fetches failure logs, rebuilds from build, pushes fix to PR.
- **Loop guard:** If fix-ci itself fails, a second `@kody fix-ci` is NOT auto-posted within 24h.
- **Bot commit guard:** No auto-trigger if the last commit is from a bot.

#### Step 4.3 — `@kody taskify --file` (no context)

Comment (T04 issue): `@kody taskify --file docs/test-prd.md`

**T23 — Issue attachments and metadata enrichment:**

Create T04's issue WITH an image attachment and labels to test this:
```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T04: taskify with attachments" \
  --body "## Task
Add a footer component.

## Design
![mockup](https://github.com/aharonyaircohen/Kody-Engine-Tester/assets/test-uuid/footer-design.png)

See the attached mockup." \
  --label "test-suite,ui"
gh issue comment <n> --repo aharonyaircohen/Kody-Engine-Tester \
  --body "Make sure the footer is responsive"
gh issue comment <n> --repo aharonyaircohen/Kody-Engine-Tester --body "@kody taskify --file docs/test-prd.md"
```

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "Downloaded attachment\|attachments/"
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "Labels:\|Discussion"
```
- Image downloaded to `attachments/` dir. **Labels:** and **Discussion** sections in task.md.
- Graceful fallback if image URL unreachable (pipeline continues, original URL preserved).

**T21 — Priority labels + section checks:**
```bash
gh issue list --repo aharonyaircohen/Kody-Engine-Tester --state open --search "[test-suite]" --json number,labels | \
  jq '.[] | {number, priority: [.labels[].name | select(startswith("priority:"))]}'
```
- Each sub-issue has exactly one priority label.

```bash
for n in <issue-numbers>; do
  body=$(gh issue view $n --repo aharonyaircohen/Kody-Engine-Tester --json body -q '.body')
  echo "$body" | grep -q "## Test Strategy" && echo "#$n OK" || echo "#$n MISSING Test Strategy"
  echo "$body" | grep -q "## Context" && echo "#$n Context OK" || echo "#$n MISSING Context"
  echo "$body" | grep -q "## Acceptance Criteria" && echo "#$n AC OK" || echo "#$n MISSING Acceptance Criteria"
done
```
- All three sections in every sub-issue body.

**Topological order:** User model issue# < endpoints issue# < middleware issue#. FAIL if violated.

#### Step 4.4 — `@kody taskify --file` (with context injection)

Ensure `.kody/memory.md` exists in the tester repo, then:

Comment (T04 issue): `@kody taskify --file docs/test-prd.md`

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "memory\|file tree\|context"
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep "{{"
```
- Project memory content and file tree appear in taskify stage logs.
- No raw `{{ }}` template tokens in logs.

---

### T22 — taskify --ticket

**1 GitHub issue. Standalone test for `--ticket` flag.**

Create issue:
```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T22: Taskify with --ticket flag" \
  --body "Testing @kody taskify --ticket JIRA-123"
```

#### Step 22.1 — `@kody taskify --ticket JIRA-123`

Comment (T22 issue): `@kody taskify --ticket JIRA-123`

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "ticket|TICKET_ID"
```
- Pipeline recognizes `TICKET_ID` mode. Ticket ID (JIRA-123) passed to taskify stage.

```bash
gh api repos/aharonyaircohen/Kody-Engine-Tester/contents/.kody/tasks \
  --jq '.[] | select(.name | contains("T22")) | .name'
```
- Task directory created for T22.

```bash
# Find the task directory and check for ticket reference
TASK_DIR=$(gh api repos/aharonyaircohen/Kody-Engine-Tester/contents/.kody/tasks \
  --jq '.[] | select(.name | contains("T22")) | .name')
gh api repos/aharonyaircohen/Kody-Engine-Tester/contents/.kody/tasks/$TASK_DIR/task.md --jq '.content' | base64 -d | grep -i "JIRA-123|ticket"
gh api repos/aharonyaircohen/Kody-Engine-Tester/contents/.kody/tasks/$TASK_DIR/task.json --jq '.content' | base64 -d | grep -i "JIRA-123|ticket"
```
- `task.md` or `task.json` contains the ticket reference (JIRA-123).

#### Step 22.2 — Cleanup

Close the T22 issue:
```bash
gh issue close <n> --repo aharonyaircohen/Kody-Engine-Tester
```

**Labels:** test-suite-temp, test-phase-1, complexity: low

---
### T05 — Bootstrap + Watch

**Bootstrap: 1 GitHub issue. Watch: run locally (parallel with everything).**

Create issue for bootstrap:
```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T05: Bootstrap" \
  --body "Testing bootstrap extend mode and artifact generation."
```

#### Step 5.1 — `@kody bootstrap`

Comment (T05 issue): `@kody bootstrap`

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "memory\|step file\|tools\|skills\|label\|extend"
```
- `.kody/memory/` has `architecture.md` and/or `conventions.md`.
- `.kody/steps/` has `taskify.md`, `plan.md`, `build.md`, `review.md`, `autofix.md`, `review-fix.md`.
- `.kody/tools.yml` exists with detected tools.
- 14 lifecycle `kody:` labels exist.
- Logs show "extending" (not "creating") if files already existed.

#### Step 5.2 — `@kody watch --dry-run` (local, parallel)

Run locally (no GitHub issue needed):
```bash
cd /path/to/Kody-Engine-Tester
kody-engine-lite watch --dry-run
```

**Verification:**
```bash
# Check for watch-state.json
gh api repos/aharonyaircohen/Kody-Engine-Tester/contents/.kody/watch-state.json 2>/dev/null
```
- Watch plugins execute (pipeline health, security scan, config health).
- Findings logged.
- `.kody/watch-state.json` updated.
- No comments posted to GitHub (dry-run).

---

### T06 — Hotfix + Release + Revert

**3 separate GitHub issues, run in parallel.**

#### T06a — `@kody hotfix`

Create issue:
```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T06a: Hotfix" \
  --body "The default export in src/utils/helpers.ts is missing. Add export default."
```

Comment: `@kody hotfix`

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "Complexity.*hotfix"
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "stage"
```
- Complexity: `⚡ hotfix`. Only build→verify→ship execute. taskify/plan/review/review-fix skipped.

```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "Running typecheck\|Running test\|Running lint"
```
- `Running typecheck:` and `Running lint:` appear. `Running test:` should NOT appear.

```bash
gh pr list --repo aharonyaircohen/Kody-Engine-Tester --state open --json number,title,labels
```
- PR created with `hotfix` label.

#### T06b — `@kody release`

Create issue:
```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T06b: Release" \
  --body "Testing release dry-run and create-release PR."
```

**Step 6b.1 — Dry-run:**

Comment: `@kody release --dry-run`

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "dry_run=\|dry-run\|bump\|version\|conventional"
```
- Mode: `release`, dry_run: `true`. Logs show commit parsing, bump type, version preview. `[dry-run]` prefix. No PR, no version changes.

```bash
gh pr list --repo aharonyaircohen/Kody-Engine-Tester --state open --head "release/" --json number
```
- No release PR created.

**Step 6b.2 — Create release PR:**

Comment: `@kody release`

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "pre-release\|CI green"
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "bump\|version"
```
- CI status checked on default branch. Version bumped correctly.

```bash
gh pr list --repo aharonyaircohen/Kody-Engine-Tester --state open --head "release/" --json number,title,labels,body
```
- PR on `release/v<version>` branch. `release` label. Changelog grouped by type (Features, Bug Fixes, etc.).

**Cleanup:** Close the release PR without merging:
```bash
gh pr close <n> --repo aharonyaircohen/Kody-Engine-Tester --delete-branch
```

#### T06c — `@kody revert`

Create issue:
```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T06c: Revert" \
  --body "Revert merged PR from Phase 4."
```

**Step 6c.1 — Explicit target:**

Comment: `@kody revert #<PR_NUMBER>`

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "mode=revert\|revert_target="
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "revert\|verify"
```
- Mode: `revert`. Merge commit SHA found. `git revert` executed. Full verify ran.

```bash
gh pr list --repo aharonyaircohen/Kody-Engine-Tester --state open --json number,title,labels
```
- Revert PR: title `revert: <original title> (#N)`, `revert` label.

**Step 6c.2 — Auto-resolve (no target):**

Comment: `@kody revert` on any Phase 4 issue whose PR was merged.

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "searching for merged PR\|Found linked PR"
```
- Engine resolves PR via branch naming convention. Same verification as 6c.1.

---

### T07 — Bootstrap model override

**Local only. Runs in parallel with Phase 3.**

```bash
cd /path/to/Kody-Engine-Tester
kody-engine-lite bootstrap --provider=minimax --model=MiniMax-M1 --force
```

**Verification:**
```bash
# Check logs for model override
gh run list --repo aharonyaircohen/Kody-Engine-Tester --workflow=kody.yml --limit 3
```
- Logs show `Model: MiniMax-M1 (provider: minimax)` — NOT config default.
- LiteLLM proxy started for non-Claude provider.
- Artifacts generated successfully.

---

## Phase 4: Cleanup + Reflect

### Cleanup

1. **Pre-merge check:** Before merging, verify all `[test-suite]` issues are still OPEN.
2. **Merge all test PRs:**
   ```bash
   for pr in $(gh pr list --repo aharonyaircohen/Kody-Engine-Tester --state open --search "test-suite" --json number -q '.[].number'); do
     gh pr merge $pr --repo aharonyaircohen/Kody-Engine-Tester --merge --delete-branch
   done
   ```
3. **Post-merge check:** After merging, verify issues auto-close via `Closes #N`:
   ```bash
   gh issue list --repo aharonyaircohen/Kody-Engine-Tester --state closed --label "test-suite" --json number,title
   ```
4. Close remaining `[test-suite]` issues not auto-closed.
5. **T02 conflict cleanup:** Revert the conflict commit from the base branch:
   ```bash
   git revert <conflict-commit-hash> --no-edit && git push origin <base>
   ```
6. Delete leftover branches: Any `[test-suite]` branches not cleaned up by PR merge.

### Reflect

#### Verify Memory Updates

1. **Auto-learn:** Check `.kody/memory/` in the tester repo:
   ```bash
   gh api repos/aharonyaircohen/Kody-Engine-Tester/contents/.kody/memory 2>/dev/null | jq '.[].name'
   ```
2. **Retrospectives:** Check `.kody/tasks/*/retrospective.md` for each completed run.
3. **Flag gaps:** Note any successful run that didn't produce learnings.

#### Summarize

Produce a final report:

**Test Results Matrix:**

| Test | Commands | Result | Retries | Version | Notes |
|------|---------|--------|---------|---------|-------|
| T01 | @kody + full + --complexity + --dry-run + --feedback | PASS | 0 | 0.1.81 | All variants |
| T02 | approve→review→fix→review→resolve→rerun→status | PASS | 0 | 0.1.81 | Chained on 1 PR |
| T03 | decompose: fallback + split + --no-compose + compose + retry + config + failure | PASS | 0 | 0.1.81 | 7 scenarios |
| T04 | fix-ci + taskify (2x with/without context) | PASS | 0 | 0.1.81 | On 1 PR |
| T05 | bootstrap + watch | PASS | 0 | 0.1.81 | Parallel |
| T06 | hotfix + release + revert | PASS | 0 | 0.1.81 | 3 issues, parallel |
| T07 | bootstrap --model override | PASS | 0 | 0.1.81 | Local |

**Fixes Made:**

| Version | What broke | Root cause | Fix |
|---------|-----------|------------|-----|
| 0.1.82 | ... | ... | ... |

**Enhancement Recommendations:**

| Priority | Enhancement | Why | Effort |
|----------|-------------|-----|--------|
| P0 | ... | Failed in N tests | Low |

#### Save Conclusions

Write a test-suite summary to project memory. Include: date, engine version range, pass/fail counts, fixes made, top recommendations.

---

## Verification Checklist

Every test must pass both functional and quality checks.

### Functional checks (does it work?)

- [ ] Workflow triggered and completed (success/failure as expected)
- [ ] Issue comments match expected pattern
- [ ] Labels set correctly (`kody:done`, `kody:waiting`, `kody:failed`, `kody:low`/`medium`/`high`)
- [ ] PR created/updated when expected
- [ ] No PR created when not expected (dry-run)
- [ ] fix-ci auto-trigger posts comment and loop guard prevents re-trigger (T04)
- [ ] Status command prints state without executing stages (T02)

### Quality checks (does it work correctly?)

**T01 — Core pipeline variants:**
- [ ] Bare `@kody` and explicit `@kody full` both resolve to "full" mode
- [ ] PR title uses issue title with type prefix — not LLM-generated verbose title
- [ ] Issue remains OPEN after PR created — not prematurely closed
- [ ] Issue auto-closes after PR merge via `Closes #N` keyword
- [ ] Complexity override logged as "override" — not "auto-detected"
- [ ] Complexity env var propagated: `COMPLEXITY=` visible in orchestrate job
- [ ] Feedback text logged in build stage
- [ ] Lifecycle labels progress: planning→building→verifying→review→done
- [ ] Previous stage label removed when new stage label added
- [ ] Complexity label persists alongside stage labels
- [ ] Retrospective tokenStats includes totalPromptTokens and perStage breakdown
- [ ] Auto-learn runs before ship — memory files appear in PR diff
- [ ] Engine starts dev server for UI tasks — KODY_DEV_SERVER_READY in logs
- [ ] Engine stops dev server after stage completes — "Dev server stopped" in logs
- [ ] Agent does NOT start its own dev server when engine manages it

**T02 — Dependent commands:**
- [ ] Review findings reference PR diff files — not random repo files
- [ ] Review uses correct diff command — `git diff origin/<base>...HEAD`
- [ ] Fix pushes to same PR — not a new PR
- [ ] Re-review produces different findings — not a duplicate of first review
- [ ] Resolve merges base branch — PR branch has the conflict commit merged in
- [ ] Rerun skips taskify+plan — resumes from build
- [ ] State bypass works — rerun not blocked by "already completed" state
- [ ] Special chars in feedback don't cause shell injection in either parser path
- [ ] Force-with-lease retry on non-fast-forward push

**T03 — Decompose:**
- [ ] Simple task (score < 6) delegates to runPipeline, PR created normally
- [ ] Complex task (score ≥ 6): 2+ sub-tasks, parallel worktrees, merge, verify, review, ship
- [ ] decompose-state.json saved with sub-task branches and outcomes
- [ ] "Decomposed Implementation" section in PR body
- [ ] --no-compose stops after parallel build — no merge/verify/review/ship phases
- [ ] Compose reads decompose-state.json, merges sub-task branches
- [ ] Compose is re-runnable — skips merge on retry, retries from verify
- [ ] Sub-task failure triggers worktree cleanup + fallback
- [ ] decompose.enabled: false skips decompose entirely, immediate fallback
- [ ] Worktrees cleaned up after successful merge or after failure

**T04 — fix-ci + taskify:**
- [ ] fix-ci comment auto-posted by workflow after CI failure
- [ ] fix-ci loop guard: second auto-trigger suppressed within 24h
- [ ] fix-ci bot commit guard: no auto-trigger if last commit from bot
- [ ] Every taskify sub-issue has exactly one priority label
- [ ] Every taskify sub-issue body contains `## Test Strategy`, `## Context`, `## Acceptance Criteria`
- [ ] Taskify files issues in dependency order — issue numbers reflect topological sort
- [ ] Project memory and file tree appear in taskify stage logs (step 4.4)
- [ ] No raw `{{ }}` template tokens in taskify logs
- [ ] T23: Image attachments downloaded to `attachments/` dir, labels and discussion in task.md
- [ ] T23: Graceful fallback if attachment download fails

**T05 — Bootstrap + watch:**
- [ ] Bootstrap generates memory, step files, tools.yml, and labels
- [ ] Bootstrap extends existing files instead of overwriting
- [ ] Watch plugins execute in dry-run without posting to GitHub
- [ ] Watch state persisted in .kody/watch-state.json

**T06 — Hotfix + release + revert:**
- [ ] Hotfix skips taskify/plan/review/review-fix — only build, verify, ship execute
- [ ] Hotfix verify skips tests — only typecheck and lint run
- [ ] Hotfix PR created with `hotfix` label
- [ ] Release dry-run produces no side effects
- [ ] Release dry-run logs show commit analysis, bump type, version preview
- [ ] Release creates PR on `release/v<version>` branch targeting default branch
- [ ] Release PR has `release` label
- [ ] Release changelog groups commits by type (Features, Bug Fixes, etc.)
- [ ] Release version bump matches conventional commit analysis
- [ ] Release pre-release checks verify CI green on default branch
- [ ] Revert with explicit `#<PR>` target finds the merged PR and its merge commit
- [ ] Revert runs full verify (typecheck+lint+tests) — not the hotfix reduced verify
- [ ] Revert PR title follows `revert: <original title> (#N)` format
- [ ] Revert PR has `revert` label applied
- [ ] Revert without target auto-resolves PR from issue branch naming convention

**T07 — Bootstrap model override:**
- [ ] Logs show override model/provider used — not config default
- [ ] LiteLLM proxy started for non-Claude provider
- [ ] Artifacts generated successfully

---

## Execution Rules

1. **Phase 1 (T01) runs first.** T02 and T04 wait for T01's PR.
2. **T03, T05, T06, T07 run in parallel with Phase 1** (independent issues).
3. **Always verify via gh CLI** — don't assume success, check issue comments and labels.
4. **Never skip a failing step** — fix or mark as `MANUAL_REVIEW`.
5. **Update docs after any engine fix** (README, CLI.md, schema, kody-manager skill, memory).
6. **Commit all fixes with tests** — no untested changes.
7. **Record everything** — the final report should be complete enough to reproduce the entire run.
8. **Verify outputs, not just status** — a "success" workflow that reviews the wrong PR is a critical bug.
9. **Budget cap:** Stop after 5 cumulative fix-retry version bumps across all tests. If fixes cascade, pause, report findings, and ask for guidance.
10. **Phase timeout:** If any single phase takes more than 3 hours wall-clock, pause and report. Resume after review.
11. **Cascade abort:** If 3+ steps in the same test fail with the same root cause, fix once and batch-retry rather than fixing per step.

## Getting Started

```bash
gh issue list --repo aharonyaircohen/Kody-Engine-Tester --state open --label "test-suite" 2>/dev/null
```

Clean up any previous test-suite issues first. Then start:

1. Create T01 issue → start chaining `@kody` variants
2. Create T03 issue → start decompose scenarios (parallel with T01)
3. Create T05 issue → bootstrap (parallel with T01)
4. Create T06 issues (3) → hotfix, release, revert (parallel with T01)
5. After T01 PR exists → create T02 issue (chain dependent commands)
6. After T01 PR exists → create T04 issue (fix-ci + taskify)
7. Run T07 locally (bootstrap model override, parallel)

---

## Consolidated Test Index

| ID | GitHub Issues | Commands | Post-Checks | Depends On |
|----|--------------|----------|-------------|------------|
| T01 | 1 | `@kody` → `@kody full` → `@kody --complexity low/high` → `@kody --dry-run` → `@kody --feedback` | T14, T15, T16, T33, T34, T35, T36 | — |
| T02 | 1 (uses T01 PR) | `approve` → `review` → `fix` → `review` → `resolve` → `rerun --from build` → `status` | T12, T13, T21, T22 | T01 PR |
| T03 | 1 | decompose: fallback → split → `--no-compose` → compose → retry → config disabled → sub-task failure | T24, T25, T26, T27, T28, T29, T30 | — |
| T04 | 1 (uses T01 PR) | fix-ci → taskify (no context) → taskify (with context) | T10, T19, T21, T22, T23 | T01 PR |
| T05 | 1 + local | `@kody bootstrap` + `@kody watch --dry-run` (local) | T31, T32 | — |
| T06 | 3 (parallel) | T06a: hotfix; T06b: release (dry-run → release); T06c: revert (explicit → auto-resolve) | T37, T38, T39, T40, T41 | T01 PR merged |
| T07 | local | `bootstrap --provider=minimax --model=MiniMax-M1 --force` | T33 | — |
| T22 | 1 | `@kody taskify --ticket JIRA-123` | — | — |
