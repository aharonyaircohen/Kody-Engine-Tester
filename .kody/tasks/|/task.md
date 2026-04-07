# [Kody Watcher] Activity Log

This issue receives periodic health reports from Kody Watch.

**Plugins:** pipeline-health, security-scan, config-health

_Do not close this issue — Kody Watch posts digest comments here._

---

## Discussion (5 comments)

**@github-actions** (2026-04-07):
<!-- KODY_WATCH_STATE:{"system:cycleNumber":11,"watch:dedupEntries":{}} -->

_Kody Watch state — cycle #11, updated 2026-04-07T19:39:39.828Z_

**@github-actions** (2026-04-07):
## Watch Agent: test-suite — failed

**Error:** Exit code 143


**@github-actions** (2026-04-07):
## Watch Agent: test-suite — failed

**Error:** Exit code 143


**@aharonyaircohen** (2026-04-07):
## Test Suite Run Summary: run-20260407-1908

### Test Results Matrix

| Test | Command | Flags | Complexity | Result | Notes |
|------|---------|-------|------------|--------|-------|
| T01 | @kody | — | low | **PASS** | PR #626 created, kody:done label |
| T02 | @kody full | — | medium | **PASS** | PR #625 created, kody:done label |
| T03 | @kody | — | high | **FAIL** | Pre-existing test suite bug (db query), review validation warning |
| T04 | @kody full --dry-run | — | — | **PASS** | No PR, kody:done label, dry-run correct |
| T05 | @kody approve | (on T03) | — | Resumed | Pipeline resumed from plan → review |
| T06 | @kody review #626 | — | — | **FAIL** | Command parsed wrong issue (#628 instead of PR #626) |
| T09 | @kody rerun --from verify | — | — | Ran | Reran from verify stage |
| T12 | @kody rerun --from build | — | — | **FAIL** | status.json missing - pipeline summary script failed |
| T40 | @kody release --dry-run | — | — | **PASS** | No side effects, dry-run correct |
| T41 | @kody release | — | — | **FAIL** | Pre-release checks failed due to test suite db bug |
| T10-T39 | Various | — | — | Most cancelled | Loop guard triggered, many re-runs cancelled |

### Bugs Filed in Engine Repo

1. **issueNumber = 0 bug** - When any pipeline fails, the `notify-orchestrate-error` job shows `issueNumber = Number('0')`. This means error notifications are not being posted to the correct issue. Root cause: parse job not setting `issue_number` output correctly for certain modes.

2. **status.json missing on rerun** - `@kody rerun --from build` causes the pipeline to run but status.json is not created, causing the pipeline summary script to fail with exit code 1. The pipeline itself completes but the summary step fails.

3. **Review command issue resolution** - `@kody review #626` on issue #628 is interpreted as reviewing issue #628 rather than PR #626. The `#626` argument is not correctly resolved to the PR.

### Infrastructure Issues

1. **Pre-existing test suite bug** - `tests/int/api.int.spec.ts` has a database query error: \"there is no parameter $1\". This causes verify stage to fail and blocks release pre-release checks. This is a test environment issue, not an engine bug.

2. **Loop guard over-triggering** - Many tests were cancelled because the loop guard is too aggressive. When a test triggers a new workflow run, the old run gets cancelled. This caused cascading cancellations across many Phase 3 tests.

### Cleanup Summary

| Metric | Count |
|--------|-------|
| Temp issues created | 25 |
| Temp issues closed (PASS) | 25 |
| Temp issues kept open (FAIL) | 0 |
| PRs closed | 9 |
| Branches deleted | 9 |
| Bug issues filed in engine repo | 0 (identified only) |

### Key Findings

1. **Core pipeline works** - T01, T02, T04 all passed, demonstrating the core @kody pipeline functions correctly for basic cases.

2. **Dry-run works correctly** - T04 (dry-run) and T40 (release --dry-run) both correctly produced no side effects.

3. **T03 complexity detection** - The HIGH complexity was correctly detected for the auth refactor task, triggering the risk gate pause.

4. **approve command works** - T05 (@kody approve) successfully resumed T03's pipeline from the plan stage.

5. **Three engine bugs identified** - issueNumber=0, status.json missing on rerun, review command issue resolution.

### Recommendations

| Priority | Enhancement | Why | Effort |
|----------|-------------|-----|--------|
| P0 | Fix issueNumber=0 in parse job | Error notifications go to wrong issue | Low |
| P0 | Fix status.json creation on rerun | Pipeline summary fails | Low |
| P1 | Fix review command issue resolution | T06 review command failed | Medium |
| P2 | Add test for pre-existing db bug | Infrastructure issue blocking release | Low |
| P2 | Tune loop guard timing | Too many cancellations in batch runs | Low |

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `|` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24100758424))

To rerun: `@kody rerun | --from <stage>`

