# [mem-20260410-1027] Memory Benchmark Digest

## Memory Benchmark Report — mem-20260410-1027

### Summary
- Issues run: 5 (M01, M02, M03, MF1, MF2)
- Succeeded: 1 / Failed: 4
- Merged PRs: 1/5 (only MF2 merged successfully)
- Total pipeline time: ~25 minutes

### Issues Encountered
- M01 (clamp utility): PR not merged, task dir exists with status.json
- M02 (token expiry): PR not merged, no task dir locally
- M03 (pagination): PR not merged, no task dir locally
- MF1 (broken import): PR not merged, no task dir locally
- MF2 (wrong return type): **PR merged** - source file created despite intended failure

### M1: Token Compression
Only partial data available (2 of 5 task directories):

| Issue | Stage | Prompt Tokens | Retries |
|-------|-------|--------------|---------|
| 1529 (M01) | taskify | 1634 | 0 |
| 1529 (M01) | build | 5233 | 0 |
| 1529 (M01) | verify | N/A | 1 |
| 1533 (MF2) | taskify | 1646 | 0 |
| 1533 (MF2) | build | 3867 | 0 |

### M2: Diary Growth
Diary entries: 1 → 2 (baseline had 1 entry)
- New entry: taskId 1533-260410-102829, room: utils

### M3: Room Scoping
Room-specific convention files: 0 created

### M4: Contradiction Detection
Only 1 run per issue - no reruns triggered (MF1/MF2 intended failures did not fail as expected)

### M5: Dedup Effectiveness
conventions.md lines: 37 → 41 (growth of 4 lines)

### M6: Retry Reduction
Insufficient data - only 2 task directories available

### Notes
- MF2 (wrong return type) was designed to fail but passed verification
- MF1 (broken import) did not produce source file
- Multiple workflow runs were cancelled before completion
- Only 1 of 5 PRs merged successfully

### Raw Data
Task directories found: 1529-260410-102822, 1533-260410-102829
Run records: 1529.jsonl, 1530.jsonl, 1531.jsonl, 1532.jsonl, 1533.jsonl (1 run each)


---

## Discussion (5 comments)

**@aharonyaircohen** (2026-04-10):
## Test Suite Run Report: run-20260410-1053

**Engine Version:** 0.1.x (latest via npm)
**Run ID:** run-20260410-1053
**Date:** 2026-04-10
**Duration:** ~45 minutes wall-clock

---

## Test Results Matrix

| Test | Command | Complexity | Result | Notes |
|------|---------|------------|--------|-------|
| T01 | @kody | low | IN_PROGRESS | Stuck 15+ min, may be hung |
| T02 | @kody full | medium | **PASS** | PR #1561 created |
| T03 | @kody (HIGH) | high | PAUSED | Risk gate fired, answered questions, approve failed at parse |
| T04 | @kody full --dry-run | - | **PASS** | No PR created, dry-run worked |
| T20 | @kody status | - | FAIL | Workflow cancelled, status command didn't trigger |
| T21 | @kody taskify | - | WAITING | Taskify asking clarification questions |
| T22 | @kody taskify | - | **PASS** | Created 3 sub-issues with priority labels + required sections |
| T24 | @kody decompose | low | IN_PROGRESS | Fell back to normal pipeline (expected) |
| T25 | @kody decompose | low | **PASS** | PR #1560 created, but decompose fell back (LOW complexity detected) |
| T26 | @kody decompose --no-compose | - | WAITING | Asking clarification questions |
| T31 | @kody bootstrap | - | FAIL | No workflow triggered |
| T37 | @kody hotfix | hotfix | IN_PROGRESS | Pipeline running |
| T40 | @kody release --dry-run | - | FAIL | No workflow triggered |
| T41 | @kody release | - | FAIL | No workflow triggered |
| T05 | @kody approve (T03) | - | FAIL | Parse job failed - GH_TOKEN not propagated |
| T06 | @kody review (PR #1561) | - | IN_PROGRESS | Orchestrate running |

---

## Critical Bugs Found

### Bug 1: GH_TOKEN Not Propagated to Subprocesses (CRITICAL)
**Symptom:** Parse job fails with `gh: To use GitHub CLI in a GitHub Actions workflow, set the GH_TOKEN environment variable` even though GH_TOKEN is set in workflow env.

**Root Cause:** The kody-engine CLI spawns `gh` commands as child processes via Node.js `execSync`/`exec`. The GH_TOKEN environment variable is set in the workflow step env, but not being inherited by subprocesses spawned by the npm-installed kody-engine binary.

**Evidence:** 
- T03 `@kody approve` → parse fails at `ensureTaskMarkerComment`
- T05 approve retry → same failure
- All commands that try to post comments via gh CLI fail

**Impact:** Blocks all commands that require gh CLI operations (comment posting, PR creation, etc.)

### Bug 2: Workflow Name Mismatch for fix-ci
**Symptom:** test-ci.yml is named \"Test CI\" but kody.yml fix-ci-trigger watches for workflow name \"CI\"

**Impact:** T19 fix-ci auto-trigger will not fire when test-ci.yml fails

---

## Infrastructure Issues

1. **Stuck Orchestrate Jobs**: T01, T24, T37 orchestrate jobs running 15+ min without output - possibly hung or GitHub API returning stale data
2. **test-ci.yml Already Broken**: The breakable CI was already set up with `exit 1` from a prior run
3. **Workflow Runs Cancelled**: Many runs showing as cancelled - possible concurrency issues

---

## Passing Tests

1. **T02 (@kody full)**: PASSED - MEDIUM complexity, PR #1561 created, correct behavior
2. **T04 (--dry-run)**: PASSED - No PR created, stages skipped correctly
3. **T22 (taskify context)**: PASSED - Created 3 sub-issues with:
   - Priority labels: all `priority:high`
   - Required sections: ## Test Strategy, ## Context, ## Acceptance Criteria all present
4. **T25 (decompose fallback)**: PASSED (partial) - PR created via fallback, but decompose wasn't tested because LOW complexity detected

---

## Tests Requiring Manual Intervention

1. **T03 (HIGH complexity)**: Needs approval with clarified requirements - questions answered but approve failed
2. **T05 (approve)**: Blocked by GH_TOKEN bug
3. **T06 (review)**: Running but may fail due to GH_TOKEN issue
4. **T21 (taskify)**: Waiting for clarification on password hashing algorithm
5. **T26 (decompose --no-compose)**: Waiting for clarification

---

## Cleanup Summary

| Metric | Count |
|--------|-------|
| Temp issues created | 15 |
| Temp issues closed (PASS) | 0 |
| Temp issues open | 15 |
| PRs created | 2 (#1560, #1561) |
| Bug issues filed | 0 (would file in engine repo) |

---

## Recommendations

### P0 (Critical - Block All Tests)
1. **Fix GH_TOKEN propagation in kody-engine**: The CLI must pass GH_TOKEN to all subprocess gh commands
2. **Fix workflow name mismatch**: Either rename test-ci.yml workflow to \"CI\" or update kody.yml fix-ci-trigger to watch for \"Test CI\"

### P1 (High - Degrade Test Quality)
3. **Investigate stuck orchestrate jobs**: T01, T24, T37 have been running 15+ min - possible LLM timeout or agent loop
4. **T25 complexity scoring**: Complex multi-area task scored LOW - complexity detection may be under-weighting task complexity

### P2 (Medium - Test Setup Issues)
5. **T20 status command**: @kody status workflow cancelled - investigate why
6. **T31, T40, T41 not triggering**: Bootstrap, release commands didn't trigger workflows

---

## Memory Delta

No new memory files generated during this run. Auto-learn and retrospective systems not exercised due to pipeline failures.

---

*Report generated by Kody Watch agent. Run ID: run-20260410-1053*

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `|` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24240070297))

To rerun: `@kody rerun | --from <stage>`

**@aharonyaircohen** (2026-04-10):
🤔 **Kody has questions before proceeding:**

1. Should bug reports be filed in this tester repo or the kody-engine repo?
2. Is there an existing bug template or process for reporting engine issues?
3. Should the P1 items (stuck jobs, complexity scoring) also be filed as bugs or only the P0 critical items?

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-10):
@kody approve

1. Bug reports -> file in aharonyaircohen/Kody-Engine-Lite (the engine repo)
2. Use GitHub's default issue template for engine bugs
3. File P1 items as bugs too - apply your own judgment on severity

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `|` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24242158512))

To rerun: `@kody rerun | --from <stage>`

