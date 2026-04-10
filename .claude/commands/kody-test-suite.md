---
description: Complete test suite runner for Kody Engine Lite — runs every CLI command and flag combination as live E2E tests, fixes failures, and produces a comprehensive report
---

You are the Kody Complete Test Suite runner. Your job is to systematically run every CLI command and flag combination documented in docs/CLI.md as live end-to-end tests on the https://github.com/aharonyaircohen/Kody-Engine-Tester repo, fix any failures in the engine, and produce a comprehensive report with enhancement recommendations.

## Overview

The suite runs in 4 phases across **19+ GitHub issues** — one issue per command variant. Each test gets its own issue and runs independently.

```
Phase 1: Core Pipeline (independent @kody variants — run in parallel)
Phase 2: Dependent Commands (review, fix, resolve, rerun, approve — use Phase 1 PRs)
Phase 3: Complex Features (decompose, compose, bootstrap, watch, hotfix, release, revert)
Phase 4: Cleanup + Reflect
```

**Key rule:** ONE `@kody` command per issue. No chaining. If a test needs to chain commands (e.g., review→fix→review), those are SEPARATE issues, each referencing the same PR.

---

## Phase 1: Core Pipeline

Create a separate issue for each variant. All run in parallel.

### T01 — `@kody` (bare, LOW complexity)

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T01: @kody bare" \
  --body "Test bare @kody command." \
  --label "test-suite"
```

Comment: `@kody`

**Post-run checks (verify after completion):**
- PR created, title is `feat: <issue title>`
- Issue stays OPEN (not prematurely closed)
- PR body contains `Closes #<issue_number>`
- Labels progress: planning→building→verifying→review→done

### T02 — `@kody full` (explicit MEDIUM)

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T02: @kody full" \
  --body "Test explicit @kody full command." \
  --label "test-suite"
```

Comment: `@kody full`

### T03 — `@kody --complexity high` (risk gate)

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T03: @kody high complexity (risk gate)" \
  --body "Redesign auth: replace session-based auth with JWT, migrate user schema, add RBAC with admin/editor/viewer roles, update all API routes" \
  --label "test-suite"
```

Comment: `@kody --complexity high`

**Verification:** Pipeline pauses at the risk gate.

### T04 — `@kody --dry-run`

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T04: @kody dry-run" \
  --body "Test dry-run flag." \
  --label "test-suite"
```

Comment: `@kody --dry-run`

**Verification:** No PR created. All stages skipped.

### T05 — `@kody --complexity low`

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T05: @kody --complexity low" \
  --body "Test complexity override flag." \
  --label "test-suite"
```

Comment: `@kody --complexity low`

**Verification:** Logs show `Complexity override: low`. taskify→build→verify→ship (4 stages only).

### T06 — `@kody --feedback "Use functional style"`

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T06: @kody --feedback flag" \
  --body "Test feedback injection." \
  --label "test-suite"
```

Comment: `@kody --feedback "Use functional style"`

**Verification:** `feedback: Use functional style` appears in build stage logs.

---

## Phase 2: Dependent Commands

All of these use the PR from T01 or T02. Each command is a separate issue.

### T07 — `@kody approve` (conditional — skip if T03 didn't pause)

If T03 paused at the risk gate, create:

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T07: @kody approve" \
  --body "Approve T03's paused pipeline." \
  --label "test-suite"
```

Comment: `@kody approve`

### T08 — `@kody review`

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T08: @kody review" \
  --body "Review the PR from T01." \
  --label "test-suite"
```

Comment: `@kody review` (on T01's PR)

**Verification:**
- Review comment posted
- Findings reference PR diff files (check logs for `git diff origin/<base>...HEAD`, not bare `git diff`)
- Findings are NOT random repo files

### T09 — `@kody fix`

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T09: @kody fix" \
  --body "Fix review findings on T01's PR." \
  --label "test-suite"
```

Comment: `@kody fix` (on T01's PR)

**Verification:** Fix pushed to the SAME PR, not a new PR.

### T10 — `@kody review` (re-review)

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T10: @kody review re-review" \
  --body "Re-review T01's PR after fix." \
  --label "test-suite"
```

Comment: `@kody review` (on T01's PR)

**Verification:** New review comment differs from T08 findings.

### T11 — `@kody resolve`

**Setup before commenting (create a conflict):**
```bash
PR_NUM=<T01_PR_NUMBER>
BASE=$(gh pr view $PR_NUM --json baseRefName -q '.baseRefName')
git fetch origin $BASE
git checkout $BASE
# Edit the same file T01 modified (same lines)
git commit -m "test: create conflict for T11"
git push origin $BASE
```

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T11: @kody resolve" \
  --body "Resolve merge conflict on T01's PR." \
  --label "test-suite"
```

Comment: `@kody resolve` (on T01's PR)

**Verification:** PR branch merged with base changes. Resolve comment confirms success.

**Phase 4 cleanup:** Revert the conflict commit from base branch.

### T12 — `@kody rerun --from build`

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T12: @kody rerun --from build" \
  --body "Rerun T01's pipeline from build stage." \
  --label "test-suite"
```

Comment: `@kody rerun --from build` (on T01's issue)

**Verification:**
- Logs show `Resuming from: build`. taskify and plan NOT executed.
- Pipeline re-executes (not blocked by "already completed" state).

### T13 — `@kody status`

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T13: @kody status" \
  --body "Test status command on T01." \
  --label "test-suite"
```

Comment: `@kody status` (on T01's issue)

**Verification:** Pipeline state printed from status.json. No stages executed.

---

## Phase 3: Complex Features

### T14 — `@kody fix-ci` auto-trigger + loop guard

**Precondition:** Requires a PR from Phase 1.

**Setup:**
```bash
PR_NUM=<PHASE1_PR_NUMBER>
BRANCH=$(gh pr view $PR_NUM --json headRefName -q '.headRefName')
git fetch origin $BRANCH
git checkout $BRANCH
# Introduce a type error in a test file
git commit -m "test: break type check for T14"
git push origin $BRANCH
```

Wait for CI to fail.

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T14: @kody fix-ci" \
  --body "Test fix-ci auto-trigger on T01's PR." \
  --label "test-suite"
```

Comment: `@kody fix-ci` (or it auto-posts if `fix-ci-trigger` is configured)

**Verification:**
- `@kody fix-ci` pipeline runs, fetches failure logs, rebuilds from build, pushes fix to PR
- **Loop guard:** If fix-ci itself fails, a second `@kody fix-ci` is NOT auto-posted within 24h
- **Bot commit guard:** No auto-trigger if the last commit is from a bot

### T15 — `@kody taskify --file` — priority labels + sections + topo order

**Setup — create PRD file:**
```bash
gh api repos/aharonyaircohen/Kody-Engine-Tester/contents/docs/test-prd.md \
  --method PUT \
  --field message="test: add PRD for T15" \
  --field content="$(echo '# Auth Feature
Add JWT authentication.

## Tasks
1. Add User model with password hash field
2. Add /login and /register endpoints (depends on User model)
3. Add auth middleware to protect existing routes (depends on endpoints)' | base64)"
```

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T15: @kody taskify --file" \
  --body "Test taskify with PRD file." \
  --label "test-suite"
```

Comment: `@kody taskify --file docs/test-prd.md`

**Verification:**

Priority labels:
```bash
gh issue list --repo aharonyaircohen/Kody-Engine-Tester --state open --search "[test-suite]" --json number,labels | \
  jq '.[] | {number, priority: [.labels[].name | select(startswith("priority:"))]}'
```
- Each sub-issue has exactly one of `priority:high`, `priority:medium`, `priority:low`

Issue body sections:
```bash
for n in <issue-numbers>; do
  body=$(gh issue view $n --repo aharonyaircohen/Kody-Engine-Tester --json body -q '.body')
  echo "$body" | grep -q "## Test Strategy" && echo "#$n OK" || echo "#$n MISSING"
  echo "$body" | grep -q "## Context" && echo "#$n OK" || echo "#$n MISSING"
  echo "$body" | grep -q "## Acceptance Criteria" && echo "#$n OK" || echo "#$n MISSING"
done
```
- All three sections in every sub-issue body

Topological order: User model issue# < endpoints issue# < middleware issue#. FAIL if violated.

### T16 — `@kody taskify --file` with context injection

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T16: @kody taskify context injection" \
  --body "Test taskify with project memory and file tree context." \
  --label "test-suite"
```

Ensure `.kody/memory.md` exists in the tester repo, then:

Comment: `@kody taskify --file docs/test-prd.md`

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "memory\|file tree\|context"
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep "{{"
```
- Project memory content and file tree appear in taskify stage logs
- No raw `{{ }}` template tokens

### T17 — `@kody decompose` simple task fallback

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T17: decompose fallback (simple task)" \
  --body "Add a string capitalize utility function in src/utils/strings.ts with tests" \
  --label "test-suite"
```

Comment: `@kody decompose`

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "complexity_score\|falling back"
```
- `complexity_score < 6` → fallback to `runPipeline()`, PR created normally

### T18 — `@kody decompose` complex task full split

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T18: decompose full split (complex task)" \
  --body "Add a complete notification system: notification model in src/models/, notification service in src/services/, notification API routes in src/routes/, notification utility helpers in src/utils/, unit tests in src/__tests__/" \
  --label "test-suite"
```

Comment: `@kody decompose`

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "decomposable\|sub-task\|parallel\|merge\|ship"
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "worktree removed\|cleaned"
```
- `complexity_score ≥ 6`, 2+ sub-tasks, parallel worktrees, merge, verify, review, ship
- "Decomposed Implementation" section in PR body
- `decompose-state.json` saved
- Worktrees cleaned up

### T19 — `@kody decompose --no-compose`

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T19: decompose --no-compose" \
  --body "Same complex notification system as T18" \
  --label "test-suite"
```

Comment: `@kody decompose --no-compose`

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "no-compose\|decompose-state"
```
- Parallel builds complete. `decompose-state.json` saved. NO merge/verify/review/ship. No PR created.
- Get the `task-id` from logs.

### T20 — `@kody compose` (re-runnable)

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T20: @kody compose" \
  --body "Run compose on T19's task-id to complete the decompose flow." \
  --label "test-suite"
```

Comment: `@kody compose --task-id <task-id-from-T19>`

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "merge.*skip\|compose phase\|ship"
```
- Merge skipped. Verify+review re-execute. Ship completes. PR created.

**Retry test:** Edit `decompose-state.json` to set `compose.verify: "failed"`, then retry:
```bash
gh issue comment <n> --repo aharonyaircohen/Kody-Engine-Tester --body "@kody compose --task-id <task-id>"
```
- Merge skipped again. Verify+review retried. Ship completes.

### T21 — `@kody decompose` config disabled

**Setup:**
```bash
# Add decompose.enabled: false to kody.config.json via API
```

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T21: decompose config disabled" \
  --body "Test decompose with config disabled." \
  --label "test-suite"
```

Comment: `@kody decompose`

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "decompose disabled\|falling back"
```
- Immediate fallback to normal pipeline. No decompose artifacts.

**Cleanup:** Revert the config change after verification.

### T22 — `@kody decompose` sub-task failure

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T22: decompose sub-task failure" \
  --body "Implement a caching system: Redis adapter in src/cache/redisAdapter.ts (requires 'ioredis' — NOT installed), in-memory adapter in src/cache/memoryAdapter.ts, cache manager in src/cache/cacheManager.ts, cache middleware in src/middleware/cacheMiddleware.ts" \
  --label "test-suite"
```

Comment: `@kody decompose`

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "sub-task.*failed\|cleanup\|fallback"
```
- Sub-task failure detected, worktrees cleaned up, fallback to `runPipeline()`

### T23 — `@kody bootstrap`

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T23: @kody bootstrap" \
  --body "Test bootstrap command extend mode and artifact generation." \
  --label "test-suite"
```

Comment: `@kody bootstrap`

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "memory\|step file\|tools\|skills\|label\|extend"
```
- `.kody/memory/` has `architecture.md`/`conventions.md`
- `.kody/steps/` has `taskify.md`, `plan.md`, `build.md`, `review.md`, `autofix.md`, `review-fix.md`
- `.kody/tools.yml` exists with detected tools
- 14 lifecycle `kody:` labels exist
- Logs show "extending" (not "overwriting") if files existed

### T24 — `@kody watch --dry-run` (local)

Run locally (no GitHub issue needed):
```bash
cd /path/to/Kody-Engine-Tester
kody-engine-lite watch --dry-run
```

**Verification:**
- Watch plugins execute (pipeline health, security scan, config health)
- Findings logged
- `.kody/watch-state.json` updated
- No comments posted to GitHub (dry-run)

### T25 — `@kody hotfix`

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T25: @kody hotfix" \
  --body "The default export in src/utils/helpers.ts is missing. Add export default to the main function." \
  --label "test-suite"
```

Comment: `@kody hotfix`

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "Complexity.*hotfix"
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "Running typecheck\|Running test\|Running lint"
```
- Complexity: `⚡ hotfix`. Only build→verify→ship execute. taskify/plan/review/review-fix skipped.
- `Running typecheck:` and `Running lint:` appear. `Running test:` should NOT appear.

```bash
gh pr list --repo aharonyaircohen/Kody-Engine-Tester --state open --json number,title,labels
```
- PR created with `hotfix` label

### T26 — `@kody release --dry-run`

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T26: @kody release --dry-run" \
  --body "Test release dry-run." \
  --label "test-suite"
```

Comment: `@kody release --dry-run`

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "dry_run=\|dry-run\|bump\|version\|conventional"
```
- Mode: `release`, dry_run: `true`. Logs show commit parsing, bump type, version preview. `[dry-run]` prefix.
- No PR, no version changes.

```bash
gh pr list --repo aharonyaircohen/Kody-Engine-Tester --state open --head "release/" --json number
```
- No release PR created

### T27 — `@kody release`

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T27: @kody release" \
  --body "Test release with PR creation." \
  --label "test-suite"
```

Comment: `@kody release`

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "pre-release\|CI green\|bump\|version"
```
- CI status checked on default branch. Version bumped correctly.

```bash
gh pr list --repo aharonyaircohen/Kody-Engine-Tester --state open --head "release/" --json number,title,labels,body
```
- PR on `release/v<version>` branch. `release` label. Changelog grouped by type.

**Cleanup:** Close the release PR without merging:
```bash
gh pr close <n> --repo aharonyaircohen/Kody-Engine-Tester --delete-branch
```

### T28 — `@kody revert #<PR>` (explicit target)

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T28: @kody revert explicit" \
  --body "Revert a merged PR." \
  --label "test-suite"
```

Comment: `@kody revert #<MERGED_PR_NUMBER>`

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "mode=revert\|revert_target=\|revert\|verify"
```
- Mode: `revert`. Merge commit SHA found. `git revert` executed. Full verify ran.

```bash
gh pr list --repo aharonyaircohen/Kody-Engine-Tester --state open --json number,title,labels
```
- Revert PR: title `revert: <original title> (#N)`, `revert` label

### T29 — `@kody revert` (auto-resolve)

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T29: @kody revert auto-resolve" \
  --body "Revert a merged PR using auto-resolve (no explicit target)." \
  --label "test-suite"
```

Comment: `@kody revert` (on an issue whose PR was merged)

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "searching for merged PR\|Found linked PR"
```
- Engine resolves PR via branch naming convention. Same verification as T28.

### T30 — Issue attachments + metadata enrichment

```bash
gh issue create --repo aharonyaircohen/Kody-Engine-Tester \
  --title "[test-suite] T30: issue attachments and metadata enrichment" \
  --body "## Task
Add a footer component.

## Design
![mockup](https://github.com/aharonyaircohen/Kody-Engine-Tester/assets/test-uuid/footer-design.png)

See the attached mockup." \
  --label "test-suite,ui"
gh issue comment <n> --repo aharonyaircohen/Kody-Engine-Tester --body "Make sure the footer is responsive"
gh issue comment <n> --repo aharonyaircohen/Kody-Engine-Tester --body "@kody taskify --file docs/test-prd.md"
```

**Verification:**
```bash
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "Downloaded attachment\|attachments/"
gh run view <id> --log --repo aharonyaircohen/Kody-Engine-Tester | grep -i "Labels:\|Discussion"
```
- Image downloaded to `attachments/` dir. **Labels:** and **Discussion** sections in task.md.
- Graceful fallback if image URL unreachable (pipeline continues, original URL preserved).

### T31 — Bootstrap model override (local)

```bash
cd /path/to/Kody-Engine-Tester
kody-engine-lite bootstrap --provider=minimax --model=MiniMax-M1 --force
```

**Verification:**
- Logs show `Model: MiniMax-M1 (provider: minimax)` — NOT config default
- LiteLLM proxy started for non-Claude provider
- Artifacts generated

---

## Phase 4: Cleanup + Reflect

### Cleanup

1. **Pre-merge check:** Verify all `[test-suite]` issues are still OPEN before merging.
2. **Merge all test PRs:**
   ```bash
   for pr in $(gh pr list --repo aharonyaircohen/Kody-Engine-Tester --state open --search "test-suite" --json number -q '.[].number'); do
     gh pr merge $pr --repo aharonyaircohen/Kody-Engine-Tester --merge --delete-branch
   done
   ```
3. **Post-merge check:** Verify issues auto-close via `Closes #N`:
   ```bash
   gh issue list --repo aharonyaircohen/Kody-Engine-Tester --state closed --label "test-suite" --json number,title
   ```
4. Close remaining `[test-suite]` issues not auto-closed.
5. **T11 conflict cleanup:** Revert the conflict commit from base branch:
   ```bash
   git revert <conflict-commit-hash> --no-edit && git push origin <base>
   ```
6. Delete leftover branches.

### Reflect

#### Memory Updates

1. **Auto-learn:** Check `.kody/memory/` in the tester repo:
   ```bash
   gh api repos/aharonyaircohen/Kody-Engine-Tester/contents/.kody/memory 2>/dev/null | jq '.[].name'
   ```
2. **Retrospectives:** Check `.kody/tasks/*/retrospective.md` for each completed run
3. **Token ROI:** Check `observer-log.jsonl` for `tokenStats.totalPromptTokens` and `tokenStats.perStage`

#### Final Report

**Test Results Matrix:**

| Test | Command | Result | Retries | Version | PR |
|------|---------|--------|---------|---------|-----|
| T01 | @kody | PASS/FAIL | 0 | 0.1.x | #N |
| T02 | @kody full | PASS/FAIL | 0 | 0.1.x | #N |
| ... | ... | ... | ... | ... | ... |

**Fixes Made:**

| Version | What broke | Root cause | Fix |
|---------|-----------|------------|-----|
| 0.1.x | ... | ... | ... |

**Enhancement Recommendations:**

| Priority | Enhancement | Why | Effort |
|----------|-------------|-----|--------|
| P0 | ... | Failed in N tests | Low |

#### Save Conclusions

Write a test-suite summary to project memory. Include: date, engine version range, pass/fail counts, fixes made, top recommendations.

---

## Verification Checklist

### Functional checks (does it work?)

- [ ] Workflow triggered and completed
- [ ] Issue comments match expected pattern
- [ ] Labels set correctly (`kody:done`, `kody:waiting`, `kody:failed`, `kody:low/medium/high`)
- [ ] PR created/updated when expected
- [ ] No PR created when not expected (dry-run)
- [ ] fix-ci auto-trigger posts comment and loop guard prevents re-trigger (T14)
- [ ] Status command prints state without executing stages (T13)

### Quality checks (does it work correctly?)

**Core pipeline:**
- [ ] Bare `@kody` and `@kody full` both resolve to "full" mode (T01, T02)
- [ ] PR title uses issue title with type prefix (T01)
- [ ] Issue remains OPEN after PR created (T01)
- [ ] Issue auto-closes after PR merge via `Closes #N` (T01, Phase 4)
- [ ] Complexity override logged as "override" — not "auto-detected" (T05)
- [ ] Feedback text logged in build stage (T06)
- [ ] Lifecycle labels progress planning→building→verifying→review→done (T01)
- [ ] Hotfix skips taskify/plan/review/review-fix — only build→verify→ship (T25)
- [ ] Hotfix verify skips tests — only typecheck and lint run (T25)
- [ ] Hotfix PR has `hotfix` label (T25)

**Dependent commands:**
- [ ] Review findings reference PR diff files (T08)
- [ ] Review uses `git diff origin/<base>...HEAD` (T08)
- [ ] Fix pushes to same PR — not a new PR (T09)
- [ ] Re-review produces different findings than first review (T10)
- [ ] Resolve merges base branch with conflict (T11)
- [ ] Rerun skips taskify+plan, resumes from build (T12)
- [ ] State bypass — rerun not blocked by "already completed" (T12)

**Decompose:**
- [ ] Simple task (score < 6) delegates to runPipeline (T17)
- [ ] Complex task (score ≥ 6): sub-tasks, parallel build, merge, verify, review, ship (T18)
- [ ] decompose-state.json saved (T18)
- [ ] "Decomposed Implementation" section in PR body (T18)
- [ ] --no-compose stops after parallel build (T19)
- [ ] Compose merges sub-tasks, re-runs verify+review (T20)
- [ ] Compose re-runnable — skips merge on retry (T20)
- [ ] Sub-task failure triggers cleanup + fallback (T22)
- [ ] decompose.enabled: false immediate fallback (T21)

**Taskify:**
- [ ] Every sub-issue has exactly one priority label (T15)
- [ ] Every sub-issue body has `## Test Strategy`, `## Context`, `## Acceptance Criteria` (T15)
- [ ] Taskify files issues in topological order (T15)
- [ ] Project memory + file tree in taskify logs (T16)
- [ ] No raw `{{ }}` template tokens in logs (T16)
- [ ] Issue attachments downloaded, labels + discussion in task.md (T30)

**Bootstrap + watch:**
- [ ] Bootstrap generates memory, step files, tools.yml, labels (T23)
- [ ] Bootstrap extends existing files — not overwriting (T23)
- [ ] Watch plugins execute in dry-run, no GitHub posts (T24)
- [ ] Model override logs show override model, not config default (T31)

**Release + revert:**
- [ ] Release dry-run produces no side effects (T26)
- [ ] Release dry-run logs show commit analysis + bump type (T26)
- [ ] Release creates PR on `release/v<version>` with `release` label (T27)
- [ ] Release changelog groups commits by type (T27)
- [ ] Release version bump matches conventional commit analysis (T27)
- [ ] Revert PR title: `revert: <original title> (#N)` (T28, T29)
- [ ] Revert PR has `revert` label (T28, T29)
- [ ] Revert auto-resolve finds PR via branch naming convention (T29)

**fix-ci:**
- [ ] fix-ci comment auto-posted after CI failure (T14)
- [ ] Loop guard suppresses second auto-trigger within 24h (T14)
- [ ] Bot commit guard prevents auto-trigger on bot commits (T14)

---

## Execution Rules

1. **Phase 1 (T01–T06) runs in parallel** — all independent.
2. **Phase 2 (T07–T13) starts after Phase 1 PR exists** — each on its own issue.
3. **Phase 3 (T14–T31) runs in parallel where possible** — decompose variants, bootstrap, hotfix, release, revert all independent.
4. **Always verify via gh CLI** — don't assume success.
5. **Never skip a failing test** — fix or mark as `MANUAL_REVIEW`.
6. **Update docs after any engine fix.**
7. **Commit all fixes with tests** — no untested changes.
8. **Record everything** in the final report.
9. **Budget cap:** Stop after 5 cumulative fix-retry version bumps. Pause and report.
10. **Cascade abort:** If 3+ tests fail with the same root cause, fix once and batch-retry.

## Getting Started

```bash
gh issue list --repo aharonyaircohen/Kody-Engine-Tester --state open --label "test-suite" 2>/dev/null
```

Clean up any previous test-suite issues first. Then:

1. Create T01–T06 in parallel (Phase 1 core pipeline)
2. After any Phase 1 PR exists → create T07–T13 (Phase 2 dependent)
3. Create T14–T31 in parallel (Phase 3 complex features)
4. Phase 4: cleanup + reflect

---

## Test Index

| ID | Command | Depends On | Notes |
|----|---------|-----------|-------|
| T01 | `@kody` | — | LOW, PR created |
| T02 | `@kody full` | — | MEDIUM explicit |
| T03 | `@kody --complexity high` | — | Risk gate pause |
| T04 | `@kody --dry-run` | — | No PR |
| T05 | `@kody --complexity low` | — | Flag override |
| T06 | `@kody --feedback` | — | Flag injection |
| T07 | `@kody approve` | T03 (if paused) | Conditional |
| T08 | `@kody review` | T01 PR | Deep review |
| T09 | `@kody fix` | T01 PR | Fix push |
| T10 | `@kody review` (re-review) | T09 | Re-review |
| T11 | `@kody resolve` | T01 PR | Conflict resolve |
| T12 | `@kody rerun --from build` | T01 issue | Stage skip |
| T13 | `@kody status` | T01 issue | Read-only |
| T14 | `@kody fix-ci` | Phase 1 PR | Auto-trigger |
| T15 | `@kody taskify --file` | — | Labels + sections |
| T16 | `@kody taskify --file` (context) | — | Memory injection |
| T17 | `@kody decompose` (simple) | — | Fallback |
| T18 | `@kody decompose` (complex) | — | Full split |
| T19 | `@kody decompose --no-compose` | — | State only |
| T20 | `@kody compose` | T19 | Re-runnable |
| T21 | `@kody decompose` (config off) | — | Immediate fallback |
| T22 | `@kody decompose` (failure) | — | Cleanup + fallback |
| T23 | `@kody bootstrap` | — | Artifacts + labels |
| T24 | `@kody watch --dry-run` | — | Local only |
| T25 | `@kody hotfix` | — | Fast-track |
| T26 | `@kody release --dry-run` | — | No PR |
| T27 | `@kody release` | — | PR created |
| T28 | `@kody revert #<PR>` | Merged PR | Explicit target |
| T29 | `@kody revert` | Merged PR | Auto-resolve |
| T30 | `@kody taskify` (attachments) | — | Download + enrichment |
| T31 | `bootstrap --model override` | — | Local only |
