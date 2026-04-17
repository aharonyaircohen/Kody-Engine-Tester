# Plan: Classify test suite digest run-20260417-1832

## Context

The `never` pipeline task is a **classification-only** task: it asks the agent to parse an embedded test suite digest and produce a machine-readable classification file. No code changes are needed to any source files.

## Data Source

- **File:** `.kody/tasks/never/task.md` — contains the digest from `run-20260417-1832` with 44 tests
- **Final totals** (from second comment, authoritative):
  - PASS: 20 | FAIL: 17 | INCONCLUSIVE: 7 | RUNNING: 2 | PAUSED: 1 | Total: 44

## Implementation

### Step 1 — Write `.kody/tasks/never/classify.json`

A machine-readable JSON classification of all 44 tests. Each entry maps test ID → `{ result, issue, notes }`.

```json
{
  "runId": "run-20260417-1832",
  "date": "2026-04-17",
  "total": 44,
  "summary": { "pass": 20, "fail": 17, "inconclusive": 7, "running": 2, "paused": 1 },
  "tests": {
    "P1T01": { "result": "PASS", "issue": "#2282" },
    "P1T02": { "result": "FAIL", "issue": "#2283", "notes": "medium complexity full" },
    "P1T03": { "result": "PAUSED", "issue": "#2284", "notes": "HIGH risk gate, approval pending" },
    "P1T04": { "result": "PASS", "issue": "#2285" },
    "P1T19": { "result": "RUNNING", "issue": "#2286", "notes": "fix-ci workflow, waiting for CI failure trigger" },
    "P1T20": { "result": "FAIL", "issue": "#2287", "notes": "status command" },
    "P1T21": { "result": "PASS", "issue": "#2288" },
    "P1T22": { "result": "FAIL", "issue": "#2289", "notes": "taskify context" },
    "P1T24": { "result": "PASS", "issue": "#2290" },
    "P1T25": { "result": "PASS", "issue": "#2291" },
    "P1T26": { "result": "PASS", "issue": "#2292" },
    "P1T31": { "result": "PASS", "issue": "#2293" },
    "P1T32": { "result": "FAIL", "issue": "#2294", "notes": "watch health" },
    "P1T33": { "result": "PASS", "issue": "#2295" },
    "P1T37": { "result": "PASS", "issue": "#2296" },
    "P1T40": { "result": "FAIL", "issue": "#2297", "notes": "release dry-run" },
    "P1T41": { "result": "FAIL", "issue": "#2298", "notes": "release creates PR" },
    "P2T05": { "result": "PASS", "issue": "#2299" },
    "P2T06": { "result": "FAIL", "issue": "#2300", "notes": "review on PR" },
    "P2T07": { "result": "INCONCLUSIVE", "issue": "#2301", "notes": "pipeline started, never completed" },
    "P2T07b": { "result": "PASS", "issue": "#2302" },
    "P2T08": { "result": "PASS", "issue": "#2303" },
    "P2T09": { "result": "FAIL", "issue": "#2304", "notes": "rerun from verify" },
    "P2T28": { "result": "FAIL", "issue": "#2305", "notes": "compose after --no-compose" },
    "P2T29": { "result": "PASS", "issue": "#2306" },
    "P2T38": { "result": "FAIL", "issue": "#2307", "notes": "revert merged PR" },
    "P2T39": { "result": "FAIL", "issue": "#2308", "notes": "revert auto-find" },
    "P3T10": { "result": "PASS", "issue": "#2309" },
    "P3T11": { "result": "PASS", "issue": "#2310" },
    "P3T12": { "result": "FAIL", "issue": "#2311", "notes": "--from stage" },
    "P3T13": { "result": "INCONCLUSIVE", "issue": "#2312", "notes": "pipeline started, never completed" },
    "P3T14": { "result": "INCONCLUSIVE", "issue": "#2313", "notes": "@kody never triggered" },
    "P3T15": { "result": "FAIL", "issue": "#2314", "notes": "PR title from issue" },
    "P3T16": { "result": "FAIL", "issue": "#2315", "notes": "issue stays open" },
    "P3T17": { "result": "INCONCLUSIVE", "issue": "#2316", "notes": "@kody never triggered" },
    "P3T18": { "result": "PASS", "issue": "#2318" },
    "P3T19": { "result": "PASS", "issue": "#2319" },
    "P3T23": { "result": "PASS", "issue": "#2320" },
    "P3T27": { "result": "FAIL", "issue": "#2321", "notes": "decompose config disabled" },
    "P3T30": { "result": "RUNNING", "issue": "#2322", "notes": "Decompose sub-task failure, in review stage" },
    "P3T33b": { "result": "PASS", "issue": "#2323" },
    "P3T34": { "result": "INCONCLUSIVE", "issue": "#2324", "notes": "@kody never triggered" },
    "P3T35": { "result": "FAIL", "issue": "#2325", "notes": "auto-learn memory" },
    "P3T36": { "result": "INCONCLUSIVE", "issue": "#2326", "notes": "@kody never triggered" }
  },
  "bugs": [
    { "test": "T22", "description": "Taskify context injection: no PR created, context injection failed" },
    { "test": "T22+", "description": "@kody review on PR: engine treats PR number as issue number, causing 'Issue #XXXX has no open PRs' error" }
  ]
}
```

### Step 2 — Update `.kody/tasks/never/status.json`

Mark the `plan` stage as `completed`.

## Verification

```bash
# Check total count
jq '.total' .kody/tasks/never/classify.json
# Expected: 44

# Check summary totals add up
jq '[.tests[].result] | group_by(.) | map({result: .[0], count: length})' .kody/tasks/never/classify.json
# Expected: PASS=20, FAIL=17, INCONCLUSIVE=7, RUNNING=2, PAUSED=1

# Verify status.json plan stage
jq '.stages.plan.state' .kody/tasks/never/status.json
# Expected: "completed"
```

## Files Modified

- **Write:** `.kody/tasks/never/classify.json` (new)
- **Edit:** `.kody/tasks/never/status.json` (mark plan stage complete)
