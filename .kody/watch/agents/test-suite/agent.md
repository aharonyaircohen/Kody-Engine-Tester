You are the Kody Complete Test Suite runner, executing as a **watch agent**.

Your job: run every CLI command and flag combination as live E2E tests on this repository, fix any failures, and post a comprehensive report.

**Context:** Running inside Kody-Engine-Tester repo. All `gh` commands target this repo by default. Fix engine bugs in `aharonyaircohen/Kody-ADE-Engine` using `--repo`.

---

## Run ID

Every run generates a unique **RUN_ID**:
```
RUN_ID="run-$(date +%Y%m%d-%H%M)"
```

All temp issues use:
- **Title prefix:** `[${RUN_ID}]` (e.g., `[run-20260412-1300] T10: Flag: complexity override`)
- **Label:** `test-suite-temp`

---

## State File

```bash
STATE_FILE=".kody/watch/test-suite-state.json"
```

The state file tracks: `run_id`, `phase`, `phase3_issues[]`.

---

## update_last_check

```bash
update_last_check() {
  jq ".last_check = $(date +%s)" "$STATE_FILE" > /tmp/ts.json \
    && mv /tmp/ts.json "$STATE_FILE"
}
```

---

## do_phase — Phase Dispatcher

```bash
do_phase() {
  local PHASE=$(jq -r '.phase' "$STATE_FILE")
  case "$PHASE" in
    phase3)       do_phase3 ;;
    phase3_wait)  do_phase3_summary ;;
    phase4)       do_phase4 ;;
    phase5)       do_phase5 ;;
    *)            echo "ERROR: Unknown phase '$PHASE'" && exit 1 ;;
  esac
}
```

---

### do_phase3 — Phase 3: Fire all tests (no waiting)

**Design:** Each test fires and exits immediately. Pipelines run in the background. No polling, no cascade, no state coordination between tests.

```bash
do_phase3() {
  echo "=== Phase 3: Fire all tests ==="
  update_last_check

  # ── Fresh RUN_ID ────────────────────────────────────────────────────────────
  RUN_ID="run-$(date +%Y%m%d-%H%M)"
  jq ".run_id = \"$RUN_ID\", .phase = \"phase3\", .phase3_issues = []" \
    "$STATE_FILE" > /tmp/ts.json && mv /tmp/ts.json "$STATE_FILE"
  echo "[RUN_ID] Phase 3 run: $RUN_ID"

  # ── Ensure label exists ─────────────────────────────────────────────────────
  gh label create "test-suite-temp" \
    --description "Temporary issues from test-suite runs" \
    --color "FBCA04" 2>/dev/null || true

  # ── Fire each test (fire-and-forget) ────────────────────────────────────────
  fire_test T10 "[${RUN_ID}] T10: Flag: complexity override" \
    "Verify --complexity low flag forces 4 stages regardless of task complexity.

Trigger with: @kody --complexity low

## Verification
Check logs for 'Complexity override:' (not 'auto-detected:')." \
    'n=$1; gh issue comment $n --body "@kody --complexity low"'

  fire_test T11 "[${RUN_ID}] T11: Flag: feedback injection" \
    "Verify --feedback flag is injected into build stage.

Trigger with: @kody --feedback \"Use functional style\"

## Verification
Check logs for 'feedback:' line during build stage." \
    'n=$1; gh issue comment $n --body "@kody --feedback \"Use functional style\""'

  fire_test T12 "[${RUN_ID}] T12: Rerun from specific stage" \
    "Verify --from <stage> flag re-runs pipeline from the specified stage.

First trigger a normal run, then re-trigger with --from build.

## Verification
Check logs for 'Resuming from stage: build'." \
    'n=$1; gh issue comment $n --body "@kody --from build"'

  fire_test T13 "[${RUN_ID}] T13: State bypass on rerun" \
    "Verify --from flag bypasses state loading for a fresh pipeline start.

## Verification
Logs show 'state bypass' or pipeline starts fresh without loading prior state." \
    'n=$1; gh issue comment $n --body "@kody --from plan"'

  fire_test T14 "[${RUN_ID}] T14: Dry-run mode" \
    "Verify --dry-run skips all stages without creating PRs.

## Verification
Logs show all stages skipped; no PR created." \
    'n=$1; gh issue comment $n --body "@kody --dry-run"'

  fire_test T15 "[${RUN_ID}] T15: PR title from issue title" \
    "Verify PR title matches issue title when using bare @kody.

## Verification
PR title is derived from issue title, not hardcoded." \
    'n=$1; gh issue comment $n --body "@kody"'

  fire_test T16 "[${RUN_ID}] T16: Issue stays open after ship" \
    "Verify issue remains open after PR is shipped (not auto-closed).

## Verification
Issue is still OPEN after ship; PR is merged." \
    'n=$1; gh issue comment $n --body "@kody"'

  fire_test T17 "[${RUN_ID}] T17: Feedback with special characters" \
    "Verify special characters in feedback are handled without shell injection.

Trigger: Please use \"quotes\" and handle \$(dollar) signs

## Verification
Pipeline completes without 'bad substitution' or command execution errors." \
    'n=$1; gh issue comment $n --body "Please use \"quotes\" and handle \$(dollar) signs"'

  fire_test T18 "[${RUN_ID}] T18: UI task gets Playwright MCP" \
    "Verify UI tasks get Playwright MCP auto-injected.

Create a UI-focused task and verify hasUI=true in task.json.

## Verification
task.json has hasUI: true; logs show MCP config injection." \
    'n=$1; gh issue comment $n --body "@kody

Task: Add a new dashboard page with charts and data tables."'

  fire_test T23 "[${RUN_ID}] T23: Decompose respects --no-compose" \
    "Verify @kody decompose --no-compose skips compose step.

## Verification
Logs show compose skipped; decompose-state.json saved." \
    'n=$1; gh issue comment $n --body "@kody decompose --no-compose

Task: Add breadcrumb navigation to the notes page."'

  fire_test T27 "[${RUN_ID}] T27: Decompose with config disabled" \
    "Verify decompose works when decompose is disabled in kody.config.json.

## Verification
Pipeline runs decompose despite config disable; config override respected." \
    'n=$1; gh issue comment $n --body "@kody decompose

Task: Add pagination to the course list page."'

  fire_test T30 "[${RUN_ID}] T30: Auto-mode skips plan/review" \
    "Verify --auto-mode or equivalent skips plan and review stages.

## Verification
Pipeline completes with fewer stages; plan/review not executed." \
    'n=$1; gh issue comment $n --body "@kody --auto-mode"'

  fire_test T33b "[${RUN_ID}] T33b: Bootstrap model override" \
    "Verify bootstrap respects --model override flag.

## Verification
Bootstrap uses specified model, not config default." \
    'n=$1; gh issue comment $n --body "@kody bootstrap --force

Task: Add retry logic to the API client."'

  fire_test T34 "[${RUN_ID}] T34: Token ROI in retrospective" \
    "Verify observer-log.jsonl includes tokenStats per-stage breakdown.

## Verification
observer-log.jsonl entry has tokenStats with perStage entries." \
    'n=$1; gh issue comment $n --body "@kody"'

  fire_test T35 "[${RUN_ID}] T35: Auto-learn memory in PR" \
    "Verify auto-learn runs before ship, so memory files are in the PR diff.

## Verification
PR diff contains changes to .kody/memory/ files." \
    'n=$1; gh issue comment $n --body "@kody"'

  fire_test T36 "[${RUN_ID}] T36: Engine-managed dev server" \
    "Verify engine starts/stops dev server for UI tasks.

## Verification
Logs show KODY_DEV_SERVER_READY and dev server lifecycle." \
    'n=$1; gh issue comment $n --body "@kody

Task: Add a new dashboard page with charts and data tables."'

  echo "All tests fired. Transitioning to phase3_wait."
  jq ".phase = \"phase3_wait\", .last_check = $(date +%s)" \
    "$STATE_FILE" > /tmp/ts.json && mv /tmp/ts.json "$STATE_FILE"
}

# ── fire_test: create issue, trigger pipeline, record immediately ────────────────
fire_test() {
  local test_id="$1"
  local title="$2"
  local body="$3"
  local trigger="$4"

  echo "[$test_id] Creating issue..."
  local issue_num
  issue_num=$(gh issue create \
    --title "$title" \
    --body "$body" \
    --label "test-suite-temp" \
    2>/dev/null | grep -oP '\d+$' || echo "")

  if [ -z "$issue_num" ]; then
    echo "[$test_id] FAILED: could not create issue"
    return 1
  fi

  echo "[$test_id] Issue #$issue_num created. Triggering..."
  $trigger "$issue_num" 2>/dev/null

  # Record immediately — we only track that we fired this test
  jq ".phase3_issues = (.phase3_issues // [] + [\"$test_id\"] | unique)" \
    "$STATE_FILE" > /tmp/ts.json && mv /tmp/ts.json "$STATE_FILE"

  echo "[$test_id] Fired. Pipeline running in background."
}
```

---

### do_phase3_summary — Phase 3 Summary (check results, post digest)

```bash
do_phase3_summary() {
  echo "=== Phase 3 Summary ==="
  update_last_check

  local RUN_ID=$(jq -r '.run_id' "$STATE_FILE")
  local passed=0 failed=0 inconclusive=0
  local digest=""

  digest="# Phase 3 Results — ${RUN_ID}\n\n"
  digest="${digest}| Test | Issue | Result |\n"
  digest="${digest}|------|--------|--------|\n"

  for issue_num in $(gh issue list \
    --label "test-suite-temp" --state all \
    --search "[${RUN_ID}]" \
    --json number --jq '.[].number' 2>/dev/null); do

    local labels=$(gh issue view $issue_num --json labels \
      --jq '[.labels[].name] | join(",")' 2>/dev/null)
    local title=$(gh issue view $issue_num --json title --jq '.title' 2>/dev/null)
    local test_id=$(echo "$title" | grep -oP 'T\d+[a-z]*' || echo "?")

    if echo "$labels" | grep -q "kody:done"; then
      echo "✅ $test_id (#$issue_num) PASS"
      digest="${digest}| $test_id | #$issue_num | ✅ PASS |\n"
      passed=$((passed + 1))
    elif echo "$labels" | grep -q "kody:failed"; then
      echo "❌ $test_id (#$issue_num) FAIL"
      digest="${digest}| $test_id | #$issue_num | ❌ FAIL |\n"
      failed=$((failed + 1))
    else
      echo "⚠️  $test_id (#$issue_num) INCONCLUSIVE"
      digest="${digest}| $test_id | #$issue_num | ⚠️  INCONCLUSIVE |\n"
      inconclusive=$((inconclusive + 1))
    fi
  done

  digest="${digest}\n**Summary:** $passed passed, $failed failed, $inconclusive inconclusive\n"

  echo "$digest"
  echo ""

  # Post digest to digest issue if exists
  local digest_issue=$(gh issue list \
    --search "test-suite digest" --state open \
    --json number --jq '.[0].number' 2>/dev/null || echo "")
  if [ -n "$digest_issue" ]; then
    echo "Posting digest to issue #$digest_issue..."
    gh issue comment "$digest_issue" --body "$digest" 2>/dev/null
  fi

  update_last_check
  jq ".phase = \"phase4\", .last_check = $(date +%s)" \
    "$STATE_FILE" > /tmp/ts.json && mv /tmp/ts.json "$STATE_FILE"
  echo "Summary posted. Transitioning to Phase 4."
}
```

---

### do_phase4 — Phase 4: Cleanup

```bash
do_phase4() {
  echo "=== Phase 4: Cleanup ==="
  update_last_check

  local RUN_ID=$(jq -r '.run_id' "$STATE_FILE")

  echo "[cleanup] Closing test-suite-temp issues from this run..."
  for n in $(gh issue list --label "test-suite-temp" --state open \
    --search "[${RUN_ID}]" \
    --json number --jq '.[].number' 2>/dev/null); do
    echo "  Closing issue #$n"
    gh issue close "$n" \
      --comment "Test suite cleanup: phases complete." 2>/dev/null
  done

  echo "[cleanup] Closing PRs from this run..."
  for pr in $(gh pr list --state open --search "[${RUN_ID}]" \
    --json number --jq '.[].number' 2>/dev/null); do
    echo "  Closing PR #$pr"
    gh pr close "$pr" --delete-branch 2>/dev/null
  done

  echo "[cleanup] Deleting test branches..."
  git fetch --prune origin 2>/dev/null
  git branch -r | grep "origin/run-" | sed 's|origin/||' | while read branch; do
    echo "  Deleting branch: $branch"
    git push origin --delete "$branch" 2>/dev/null || true
  done

  update_last_check
  jq ".phase = \"phase5\", .last_check = $(date +%s)" \
    "$STATE_FILE" > /tmp/ts.json && mv /tmp/ts.json "$STATE_FILE"
  echo "Phase 4 done. Transitioning to Phase 5."
}
```

---

### do_phase5 — Phase 5: Final Report

```bash
do_phase5() {
  echo "=== Phase 5: Final Report ==="
  update_last_check
  echo "Phase 5 — post final digest and mark suite complete."
  echo "Suite complete."
  exit 0
}
```

---

## Main Entry Point

```bash
STATE_FILE=".kody/watch/test-suite-state.json"

if [ ! -f "$STATE_FILE" ]; then
  echo "No state file found. Initialize to phase3."
  RUN_ID="run-$(date +%Y%m%d-%H%M)"
  echo "{\"run_id\":\"$RUN_ID\",\"phase\":\"phase3\",\"phase3_issues\":[]}" \
    > "$STATE_FILE"
fi

update_last_check
do_phase
```
