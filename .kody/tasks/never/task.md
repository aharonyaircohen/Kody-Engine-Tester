# [run-20260411-2048] Test Suite Digest

## Test Suite Run Summary

**Run ID:** run-20260411-2048
**Engine Version:** 0.1.81
**Date:** 2026-04-11/12

---

## Phase 1: Independent Runs

| Test | Issue | Result | Notes |
|------|-------|--------|-------|
| T01 | 1998 | PASS | Simple utility function |
| T02 | 1999 | PASS | Add middleware with tests |
| T03 | 2000 | PASS | Refactor auth system (HIGH complexity) |
| T04 | 2001 | PASS | Dry run validation |
| T19 | 2002 | PASS | Fix-CI auto-trigger |
| T20 | 2003 | PASS | Status check |
| T21 | 2004 | PASS | Taskify file mode |
| T22 | 2005 | FAIL | Taskify context injection - no PR created |
| T24 | 2006 | PASS | Decompose simple task fallback |
| T25 | 2007 | PASS | Decompose complex multi-area |
| T26 | 2008 | PASS | Decompose --no-compose |
| T31 | 2009 | PASS | Bootstrap extend mode |
| T32 | 2010 | PASS | Watch health monitoring |
| T33 | 2011 | PASS | Bootstrap model override |
| T37 | 2012 | PASS | Hotfix fast-track |
| T40 | 2013 | PASS | Release dry-run |
| T41 | 2014 | PASS | Release create PR |

---

## Phase 2: Dependent Commands

| Test | Result | Notes |
|------|--------|-------|
| T06 | PASS | Review on T01 PR #2024 - verdict PASS |
| T07 | PASS | Fix pushed commit to T01 PR |
| T07b | PASS | Re-review on T01 PR - verdict PASS |
| T09 | PASS | Rerun from verify on T01 issue |
| T28 | PASS | Compose on T26 (partial - pushed to PR) |
| T38 | PASS | Revert PR #2024 created PR #2060 |

---

## Bugs Identified

1. **T22 (Taskify context injection):** No PR created, context injection failed
2. **@kody review on PR:** Engine treats PR number as issue number, causing "Issue #XXXX has no open PRs" error when review is triggered from PR comment

---

## Fixes Applied in Prior Runs

- `c4b6d6f`: fix(entry.ts): remove @kody rerun from pipeline-start comment
- `12812c12`: fix(kody.yml): checkout into workspace root — path: . added to actions/checkout
- `3138db15`: fix(kody.yml): remove needs: [parse] from orchestrate — workflow_dispatch now triggers correctly

---

## Cleanup Completed

- All Phase 1 temp issues closed
- All Phase 1 PRs closed (T01 PR #2024 merged for T38)
- Revert PRs #2060, #2061 closed

---

## Discussion (3 comments)

**@aharonyaircohen** (2026-04-17):
# Test Suite Results — run-20260417-1832

## Summary
- **Passed:** 19
- **Failed:** 16  
- **Timeout:** 6
- **Running:** 2
- **Paused:** 1
- **Total:** 44

## Results Table

| Test | Issue | Result |
|------|-------|--------|
| P1T01 | #2282 | PASS |
| P1T02 | #2283 | FAIL |
| P1T03 | #2284 | PAUSED (awaiting approval) |
| P1T04 | #2285 | PASS |
| P1T19 | #2286 | RUNNING |
| P1T20 | #2287 | FAIL |
| P1T21 | #2288 | PASS |
| P1T22 | #2289 | FAIL |
| P1T24 | #2290 | PASS |
| P1T25 | #2291 | PASS |
| P1T26 | #2292 | PASS |
| P1T31 | #2293 | PASS |
| P1T32 | #2294 | FAIL |
| P1T33 | #2295 | PASS |
| P1T37 | #2296 | PASS |
| P1T40 | #2297 | FAIL |
| P1T41 | #2298 | FAIL |
| P2T05 | #2299 | PASS |
| P2T06 | #2300 | FAIL |
| P2T07 | #2301 | TIMEOUT |
| P2T07b | #2302 | PASS |
| P2T08 | #2303 | PASS |
| P2T09 | #2304 | FAIL |
| P2T28 | #2305 | FAIL |
| P2T29 | #2306 | PASS |
| P2T38 | #2307 | FAIL |
| P2T39 | #2308 | FAIL |
| P3T10 | #2309 | PASS |
| P3T11 | #2310 | PASS |
| P3T12 | #2311 | FAIL |
| P3T13 | #2312 | TIMEOUT |
| P3T14 | #2313 | TIMEOUT |
| P3T15 | #2314 | FAIL |
| P3T16 | #2315 | FAIL |
| P3T17 | #2316 | TIMEOUT |
| P3T18 | #2318 | PASS |
| P3T19 | #2319 | PASS |
| P3T23 | #2320 | PASS |
| P3T27 | #2321 | FAIL |
| P3T30 | #2322 | RUNNING |
| P3T33b | #2323 | PASS |
| P3T34 | #2324 | TIMEOUT |
| P3T35 | #2325 | FAIL |
| P3T36 | #2326 | TIMEOUT |

## Notes
- P1T03 (HIGH complexity risk gate): Paused, awaiting approval - manual approval posted but not yet processed
- P1T19 (Fix-CI): Running - waiting for CI failure trigger
- P3T30 (Decompose sub-task failure): Running in review stage
- 6 tests timed out without kody labels applied (pipeline triggered but did not update labels)
- Many failures due to initial trigger mechanism bug (fixed mid-run)

Generated: 2026-04-17T19:28:23Z

**@aharonyaircohen** (2026-04-17):
# Test Suite Results — run-20260417-1832

**Run:** run-20260417-1832 | **Date:** 2026-04-17 | **Total:** 44 tests

## Summary
- **Passed:** 20 | **Failed:** 17 | **Inconclusive:** 7

## Inconclusive (pipeline stalled or never triggered)
| Test | Issue | Status |
|------|-------|--------|
| P1T03 | #2284 | kody:paused — HIGH risk gate, approval pending |
| P2T07 | #2301 | Pipeline started, never completed |
| P3T13 | #2312 | Pipeline started, never completed |
| P3T14 | #2313 | @kody never triggered |
| P3T17 | #2316 | @kody never triggered |
| P3T34 | #2324 | @kody never triggered |
| P3T36 | #2326 | @kody never triggered |

## Failed Tests
| Test | Issue | Notes |
|------|-------|-------|
| P1T02 | #2283 | medium complexity full |
| P1T19 | #2286 | fix-ci workflow |
| P1T20 | #2287 | status command |
| P1T22 | #2289 | taskify context |
| P1T32 | #2294 | watch health |
| P1T40 | #2297 | release dry-run |
| P1T41 | #2298 | release creates PR |
| P2T06 | #2300 | review on PR |
| P2T09 | #2304 | rerun from verify |
| P2T28 | #2305 | compose after --no-compose |
| P2T38 | #2307 | revert merged PR |
| P2T39 | #2308 | revert auto-find |
| P3T12 | #2311 | --from stage |
| P3T15 | #2314 | PR title from issue |
| P3T16 | #2315 | issue stays open |
| P3T27 | #2321 | decompose config disabled |
| P3T35 | #2325 | auto-learn memory

## Passed Tests
P1T01, P1T04, P1T21, P1T24, P1T25, P1T26, P1T31, P1T33, P1T37, P2T05, P2T07b, P2T08, P2T29, P3T10, P3T11, P3T18, P3T19, P3T23, P3T30, P3T33b

---
*Report generated by Kody Test Suite Watch Agent*

**@aharonyaircohen** (2026-04-17):
🚀 Kody pipeline started: `never`

