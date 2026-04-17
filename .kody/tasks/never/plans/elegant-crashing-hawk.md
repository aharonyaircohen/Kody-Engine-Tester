# Plan: Execute review-fix for never task — write classify.json

## Context
The previous build agent failed silently (truncated JSONL files) before writing `classify.json`. The plan was approved (status.json shows `plan.state: completed`). The review agent confirmed the plan is ready and the `review-fix` stage is now running.

## Action
Execute the already-approved plan — no re-planning needed.

### Step 1 — Write `.kody/tasks/never/classify.json`
Machine-readable JSON with 44 entries. Each entry: `{ result, issue, notes }`.

Source data: second comment in `task.md` (authoritative summary), cross-checked against first results table.

#### PASS (20)
| Test | Issue | Notes |
|------|-------|-------|
| P1T01 | #2282 | Simple utility function |
| P1T04 | #2285 | Dry run validation |
| P1T21 | #2288 | Taskify file mode |
| P1T24 | #2290 | Decompose simple task fallback |
| P1T25 | #2291 | Decompose complex multi-area |
| P1T26 | #2292 | Decompose --no-compose |
| P1T31 | #2293 | Bootstrap extend mode |
| P1T33 | #2295 | Bootstrap model override |
| P1T37 | #2296 | Hotfix fast-track |
| P2T05 | #2299 | Independent run |
| P2T07b | #2302 | Re-review on T01 PR - verdict PASS |
| P2T08 | #2303 | Independent run |
| P2T29 | #2306 | Independent run |
| P3T10 | #2309 | Decompose sub-task success |
| P3T11 | #2310 | Decompose sub-task success |
| P3T18 | #2318 | Independent run |
| P3T19 | #2319 | Independent run |
| P3T23 | #2320 | Independent run |
| P3T30 | #2322 | Decompose sub-task in review stage |
| P3T33b | #2323 | Independent run |

#### FAIL (17)
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
| P3T35 | #2325 | auto-learn memory |

#### INCONCLUSIVE (7 — pipeline stalled or never triggered)
| Test | Issue | Notes |
|------|-------|-------|
| P1T03 | #2284 | kody:paused — HIGH risk gate, approval pending |
| P2T07 | #2301 | Pipeline started, never completed |
| P3T13 | #2312 | Pipeline started, never completed |
| P3T14 | #2313 | @kody never triggered |
| P3T17 | #2316 | @kody never triggered |
| P3T34 | #2324 | @kody never triggered |
| P3T36 | #2326 | @kody never triggered |

Total: 20 + 17 + 7 = 44 ✓

### Step 2 — Update `.kody/tasks/never/status.json`
Mark `review-fix` stage as `completed`. Set `ship` stage to `running`.

## Verification
```bash
jq '.total' .kody/tasks/never/classify.json       # → 44
jq '[.tests[].result] | group_by(.) | map({result: .[0], count: length})' .kody/tasks/never/classify.json
# → PASS=20, FAIL=17, INCONCLUSIVE=7
jq '.stages."review-fix".state' .kody/tasks/never/status.json  # → "completed"
```
