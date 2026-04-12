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
- **Title prefix:** `[${RUN_ID}]` (e.g., `[run-20260412-1300] T01: Simple utility function`)
- **Label:** `test-suite-temp`

---

## State File

```bash
STATE_FILE=".kody/watch/test-suite-state.json"
```

The state file tracks: `run_id`, `phase`, `all_issues[]` (issue numbers for all fired tests).

State updates are pushed via GitHub API so they persist across agent cycles:
```bash
push_state() {
  local tmp=$(mktemp)
  cat "$STATE_FILE" > "$tmp"
  gh api repos/aharonyaircohen/Kody-Engine-Tester/contents/.kody/watch/test-suite-state.json \
    --method PUT \
    --field message="update state [skip ci]" \
    --field content="$(base64 -b 0 < "$tmp")" \
    --field sha="$(gh api repos/aharonyaircohen/Kody-Engine-Tester/contents/.kody/watch/test-suite-state.json --jq '.sha' 2>/dev/null)" \
    > /dev/null 2>&1 || true
}
```

---

## update_last_check

```bash
update_last_check() {
  jq ".last_check = $(date +%s)" "$STATE_FILE" > /tmp/ts.json \
    && mv /tmp/ts.json "$STATE_FILE"
  push_state
}
```

---

## do_phase — Phase Dispatcher

```bash
do_phase() {
  local PHASE=$(jq -r '.phase' "$STATE_FILE")
  case "$PHASE" in
    fire)       do_fire ;;
    fire_wait)  do_fire_summary ;;
    cleanup)    do_cleanup ;;
    report)     do_report ;;
    *)          echo "Unknown phase '$PHASE'" && exit 1 ;;
  esac
}
```

---

### do_fire — Fire all tests (no waiting)

**Design:** Each test fires immediately. Pipelines run in the background. No polling, no cascade, no state coordination between tests. Approval-dependent tests (T03) launch detached `nohup` background monitors.

```bash
do_fire() {
  echo "=== Firing all tests ==="
  update_last_check

  # ── Fresh RUN_ID ────────────────────────────────────────────────────────────
  RUN_ID="run-$(date +%Y%m%d-%H%M)"

  # Init or reset state
  echo "{\"run_id\":\"$RUN_ID\",\"phase\":\"fire\",\"all_issues\":[],\"last_check\":$(date +%s)}" \
    > "$STATE_FILE"
  push_state
  echo "[RUN_ID] $RUN_ID"

  # ── Ensure label exists ─────────────────────────────────────────────────────
  gh label create "test-suite-temp" \
    --description "Temporary issues from test-suite runs" \
    --color "FBCA04" 2>/dev/null || true

  # ── Phase 1 tests ──────────────────────────────────────────────────────────

  fire_test P1T01 "[${RUN_ID}] P1T01: Simple utility function" \
    "Verify @kody on a low-complexity task creates a 4-stage pipeline and PR.

Task: Add a \`formatDate(date: Date, locale: string): string\` utility function in src/utils/dateUtils.ts with JSDoc. Include unit tests in src/utils/dateUtils.test.ts.

Command: @kody

## Verification
Check logs: complexity=LOW, 4 stages run, PR created." \
    'n=$1; gh issue comment $n --body "@kody"'

  fire_test P1T02 "[${RUN_ID}] P1T02: Medium complexity with explicit full" \
    "Verify @kody full on a medium task runs 6+ stages.

Task: Add request-rate-limiting middleware in src/middleware/rateLimit.ts that tracks requests per IP using an in-memory Map. Include unit tests.

Command: @kody full

## Verification
Check logs: complexity=MEDIUM, 6+ stages run, PR created." \
    'n=$1; gh issue comment $n --body "@kody full"'

  fire_test P1T03 "[${RUN_ID}] P1T03: HIGH complexity triggers risk gate" \
    "Verify HIGH complexity task triggers the risk gate and pauses pipeline at plan stage.

Task: Replace the entire session-based authentication system with JWT-based authentication. Migrate the user schema to include jwt_secret, exp, and iat fields. Add RBAC with admin/editor/viewer roles. Update all API routes to use the new auth middleware. Run database migrations.

Command: @kody

## Verification
Pipeline should pause at plan stage (kody:paused label). Launch nohup auto-approve monitor (see code). After approval, pipeline resumes and completes." \
    'n=$1; gh issue comment $n --body "@kody"'

  fire_test P1T04 "[${RUN_ID}] P1T04: Dry-run skips all stages" \
    "Verify --dry-run skips all stages without creating PRs.

Task: Add a CSV parser utility in src/utils/csvParser.ts with tests.

Command: @kody full --dry-run

## Verification
Logs show all stages skipped; no PR created." \
    'n=$1; gh issue comment $n --body "@kody full --dry-run"'

  fire_test P1T19 "[${RUN_ID}] P1T19: Fix-CI auto-trigger" \
    "Verify fix-ci workflow job triggers when CI fails on a PR.

Setup: T19 needs a broken CI workflow on a PR branch. The test first checks if test-ci.yml exists, creates it if not, then deliberately breaks CI on a PR branch to trigger the workflow_run event.

Command: @kody (manual trigger)

## Verification
1. test-ci.yml exists on main branch
2. Break CI on PR branch (add 'exit 1' step)
3. workflow_run event fires fix-ci-trigger job
4. @kody fix-ci comment auto-posted on PR
5. Pipeline runs in fix-ci mode, pushes fix to same PR
6. Loop guard prevents second auto-trigger within 24h" \
    'n=$1; gh issue comment $n --body "@kody"'

  fire_test P1T20 "[${RUN_ID}] P1T20: Status command no-op" \
    "Verify @kody status prints pipeline state without executing stages.

Command: @kody status

## Verification
Pipeline state printed; no stages executed." \
    'n=$1; gh issue comment $n --body "@kody status"'

  fire_test P1T21 "[${RUN_ID}] P1T21: Taskify with priority labels" \
    "Verify @kody taskify creates sub-issues with priority labels, Test Strategy sections, and correct topo order.

Command: @kody taskify --file docs/test-prd.md

Setup: Create docs/test-prd.md with a spec spanning 3 dependent tasks.

## Verification
1. Sub-issues created with priority:high/medium/low labels
2. Each sub-issue body has ## Test Strategy section
3. Each sub-issue body has ## Context section
4. Each sub-issue body has ## Acceptance Criteria section
5. Topological order correct (depends-on filed before dependent)" \
    'n=$1; gh issue comment $n --body "@kody taskify --file docs/test-prd.md"'

  fire_test P1T22 "[${RUN_ID}] P1T22: Taskify context injection" \
    "Verify taskify receives project memory and file tree context.

Command: @kody taskify --file docs/test-prd.md

## Verification
Logs show memory content and file tree injected into taskify stage." \
    'n=$1; gh issue comment $n --body "@kody taskify --file docs/test-prd.md"'

  fire_test P1T24 "[${RUN_ID}] P1T24: Decompose fallback for simple task" \
    "Verify @kody decompose falls back to normal pipeline for simple tasks.

Task: Add a string capitalize utility in src/utils/strings.ts with tests.

Command: @kody decompose

## Verification
Logs show complexity_score < 4 or not decomposable, then Delegating to normal pipeline. PR created." \
    'n=$1; gh issue comment $n --body "@kody decompose

Task: Add a string capitalize utility in src/utils/strings.ts with tests."'

  fire_test P1T25 "[${RUN_ID}] P1T25: Decompose complex multi-area task" \
    "Verify @kody decompose splits complex tasks into parallel sub-tasks.

Task: Add a complete notification system: model in src/models/notification.ts, service in src/services/notificationService.ts, API routes in src/routes/notifications.ts, helpers in src/utils/notificationHelpers.ts, plus tests.

Command: @kody decompose

## Verification
Logs show complexity_score >= 4, decomposable: true, 2+ sub-tasks. Worktrees created. Parallel builds. Merge+compose+verify+review+ship. PR body has Decomposed Implementation section." \
    'n=$1; gh issue comment $n --body "@kody decompose

Task: Add a complete notification system with model, service, routes, helpers, and tests across multiple directories."'

  fire_test P1T26 "[${RUN_ID}] P1T26: Decompose --no-compose flag" \
    "Verify @kody decompose --no-compose stops after parallel builds.

Task: Add a config validator module in src/utils/configValidator.ts with tests.

Command: @kody decompose --no-compose

## Verification
Logs show --no-compose respected, decompose-state.json saved, NO merge/verify/review/ship phases. No PR created." \
    'n=$1; gh issue comment $n --body "@kody decompose --no-compose

Task: Add a config validator module in src/utils/configValidator.ts with tests."'

  fire_test P1T31 "[${RUN_ID}] P1T31: Bootstrap extend mode" \
    "Verify @kody bootstrap generates/extends memory, step files, tools.yml, and creates lifecycle labels.

Command: @kody bootstrap

## Verification
Logs show .kody/memory/ and .kody/steps/ artifacts. gh label list shows kody: lifecycle labels." \
    'n=$1; gh issue comment $n --body "@kody bootstrap"'

  fire_test P1T32 "[${RUN_ID}] P1T32: Watch health monitoring" \
    "Verify watch --dry-run runs health plugins without posting to GitHub.

Command: @kody watch --dry-run

## Verification
Plugins execute; no comments posted to GitHub." \
    'n=$1; gh issue comment $n --body "@kody watch --dry-run"'

  fire_test P1T33 "[${RUN_ID}] P1T33: Bootstrap model override" \
    "Verify bootstrap respects --model and --provider flags.

Command: @kody bootstrap --provider=minimax --model=MiniMax-M1 --force

## Verification
Logs show MiniMax-M1 model used, not config default." \
    'n=$1; gh issue comment $n --body "@kody bootstrap --force

Task: Add retry logic to the API client."'

  fire_test P1T37 "[${RUN_ID}] P1T37: Hotfix fast-track pipeline" \
    "Verify @kody hotfix runs build→verify(skip tests)→ship, skipping taskify/plan/review.

Task: Fix the missing default export in src/utils/helpers.ts.

Command: @kody hotfix

## Verification
Logs show mode=hotfix, only 3 stages run (build/verify/ship), tests NOT run during verify, PR created." \
    'n=$1; gh issue comment $n --body "@kody hotfix

Task: Fix the missing default export in src/utils/helpers.ts."'

  fire_test P1T40 "[${RUN_ID}] P1T40: Release dry-run" \
    "Verify @kody release --dry-run analyzes commits and previews release without side effects.

Command: @kody release --dry-run

## Verification
Logs show mode=release, dry_run=true, commit parsing, bump type determined, changelog previewed. No PR created." \
    'n=$1; gh issue comment $n --body "@kody release --dry-run"'

  fire_test P1T41 "[${RUN_ID}] P1T41: Release creates PR" \
    "Verify @kody release bumps version, generates changelog, creates release PR.

Command: @kody release

## Verification
PR created with branch release/v*, version bumped in package.json, changelog in PR body." \
    'n=$1; gh issue comment $n --body "@kody release"'

  # ── Phase 2 tests ──────────────────────────────────────────────────────────

  fire_test P2T05 "[${RUN_ID}] P2T05: Approve resumes paused pipeline" \
    "Verify @kody approve on a paused issue resumes the pipeline.

Depends on: P1T03 (HIGH complexity)

## Verification
After approval on P1T03 issue, pipeline resumes from plan stage and completes." \
    'n=$1; gh issue comment $n --body "@kody approve

1. Keep UserStore as a fallback for non-Payload operations during migration
2. Check dependencies before removing — keep as fallback if anything still uses it
3. Align UserRole to RbacRole — make RbacRole the source of truth"'

  fire_test P2T06 "[${RUN_ID}] P2T06: Review on PR" \
    "Verify @kody review posts a review comment referencing files from the PR diff.

Depends on: P1T01 or P1T02

## Verification
Review comment references files in PR diff, not random repo files. Logs show git diff against base branch." \
    'n=$1; gh issue comment $n --body "@kody review"'

  fire_test P2T07 "[${RUN_ID}] P2T07: Fix rebuilds from build stage" \
    "Verify @kody fix rebuilds from build stage and pushes to same PR.

Depends on: P2T06

## Verification
Pipeline runs build stage on existing PR. Fix pushed to same PR branch, not new branch/PR." \
    'n=$1; gh issue comment $n --body "@kody fix"'

  fire_test P2T07b "[${RUN_ID}] P2T07b: Re-review after fix" \
    "Verify second @kody review shows different findings after fix.

Depends on: P2T07

## Verification
New review comment posted (not duplicate). Findings differ from P2T06 or acknowledge fixes." \
    'n=$1; gh issue comment $n --body "@kody review"'

  fire_test P2T08 "[${RUN_ID}] P2T08: Resolve merge conflicts" \
    "Verify @kody resolve detects and resolves merge conflicts on a PR.

Depends on: Any completed PR

## Verification
Pipeline detects conflict, merges base, resolves conflicts, verifies, pushes." \
    'n=$1; gh issue comment $n --body "@kody resolve"'

  fire_test P2T09 "[${RUN_ID}] P2T09: Rerun from specific stage" \
    "Verify @kody rerun --from verify re-runs from verify stage.

Depends on: Any completed task

## Verification
Pipeline resumes from verify stage. State bypass confirmed — fresh start without loading prior state." \
    'n=$1; gh issue comment $n --body "@kody rerun --from verify"'

  fire_test P2T28 "[${RUN_ID}] P2T28: Compose after --no-compose" \
    "Verify @kody compose merges sub-task branches after P1T26.

Depends on: P1T26

## Verification
Reads decompose-state.json, merges sub-task branches, verify, review, ship. PR created." \
    'n=$1; gh issue comment $n --body "@kody compose"'

  fire_test P2T29 "[${RUN_ID}] P2T29: Compose retry after failure" \
    "Verify compose retry skips already-merged branches and retries from verify.

Depends on: P2T28

## Verification
Compose skips merge (already done), retries from verify stage." \
    'n=$1; gh issue comment $n --body "@kody compose"'

  fire_test P2T38 "[${RUN_ID}] P2T38: Revert merged PR" \
    "Verify @kody revert reverts a merged PR.

Depends on: Any merged PR

## Verification
Pipeline reverts merged changes, runs verify, creates revert PR." \
    'n=$1; gh issue comment $n --body "@kody revert"'

  fire_test P2T39 "[${RUN_ID}] P2T39: Revert with no target (auto-find)" \
    "Verify @kody revert on an issue auto-finds the linked merged PR.

Depends on: P2T38

## Verification
Pipeline finds linked PR via branch naming and reverts it." \
    'n=$1; gh issue comment $n --body "@kody revert"'

  # ── Phase 3 tests ──────────────────────────────────────────────────────────

  fire_test P3T10 "[${RUN_ID}] P3T10: --complexity override" \
    "Verify --complexity low flag forces 4 stages regardless of task complexity.

Command: @kody --complexity low

## Verification
Logs show Complexity override: low (not auto-detected). 4 stages run." \
    'n=$1; gh issue comment $n --body "@kody --complexity low"'

  fire_test P3T11 "[${RUN_ID}] P3T11: --feedback injection" \
    "Verify --feedback flag is injected into build stage.

Command: @kody --feedback \"Use functional style\"

## Verification
Logs show feedback: line during build stage." \
    'n=$1; gh issue comment $n --body "@kody --feedback \"Use functional style\""'

  fire_test P3T12 "[${RUN_ID}] P3T12: --from stage flag" \
    "Verify --from <stage> re-runs pipeline from the specified stage.

Command: @kody --from build

## Verification
Logs show Resuming from stage: build." \
    'n=$1; gh issue comment $n --body "@kody --from build"'

  fire_test P3T13 "[${RUN_ID}] P3T13: State bypass on rerun" \
    "Verify --from flag bypasses state loading for fresh pipeline start.

Command: @kody --from plan

## Verification
Logs show state bypass or pipeline starts fresh." \
    'n=$1; gh issue comment $n --body "@kody --from plan"'

  fire_test P3T14 "[${RUN_ID}] P3T14: Dry-run mode" \
    "Verify --dry-run skips all stages without creating PRs.

Command: @kody --dry-run

## Verification
Logs show all stages skipped; no PR created." \
    'n=$1; gh issue comment $n --body "@kody --dry-run"'

  fire_test P3T15 "[${RUN_ID}] P3T15: PR title from issue title" \
    "Verify bare @kody uses issue title as PR title.

Command: @kody

## Verification
PR title matches issue title, not hardcoded." \
    'n=$1; gh issue comment $n --body "@kody"'

  fire_test P3T16 "[${RUN_ID}] P3T16: Issue stays open after ship" \
    "Verify issue remains OPEN after PR is shipped (not auto-closed).

Command: @kody

## Verification
Issue still OPEN after ship. PR is merged." \
    'n=$1; gh issue comment $n --body "@kody"'

  fire_test P3T17 "[${RUN_ID}] P3T17: Special characters in feedback" \
    "Verify special characters handled without shell injection.

Command: @kody --feedback 'Use \"quotes\" and handle \$(dollar) signs'

## Verification
Pipeline completes without bad substitution errors." \
    'n=$1; gh issue comment $n --body "Please use \"quotes\" and handle \$(dollar) signs"'

  fire_test P3T18 "[${RUN_ID}] P3T18: UI task gets Playwright MCP" \
    "Verify UI tasks get Playwright MCP auto-injected.

Task: Add a dashboard page with charts and data tables.

Command: @kody

## Verification
task.json has hasUI: true; logs show MCP config injection." \
    'n=$1; gh issue comment $n --body "@kody

Task: Add a new dashboard page with charts and data tables."'

  fire_test P3T23 "[${RUN_ID}] P3T23: Decompose respects --no-compose" \
    "Verify @kody decompose --no-compose skips compose step.

Command: @kody decompose --no-compose

## Verification
Logs show compose skipped; decompose-state.json saved." \
    'n=$1; gh issue comment $n --body "@kody decompose --no-compose

Task: Add breadcrumb navigation to the notes page."'

  fire_test P3T27 "[${RUN_ID}] P3T27: Decompose with config disabled" \
    "Verify decompose works when disabled in kody.config.json.

Command: @kody decompose

## Verification
Pipeline runs decompose; config override respected." \
    'n=$1; gh issue comment $n --body "@kody decompose

Task: Add pagination to the course list page."'

  fire_test P3T30 "[${RUN_ID}] P3T30: Auto-mode skips plan/review" \
    "Verify auto-mode or equivalent skips plan and review stages.

Command: @kody --auto-mode

## Verification
Pipeline completes with fewer stages; plan/review not executed." \
    'n=$1; gh issue comment $n --body "@kody --auto-mode"'

  fire_test P3T33b "[${RUN_ID}] P3T33b: Bootstrap model override" \
    "Verify bootstrap respects --model override flag.

Command: @kody bootstrap --force

## Verification
Bootstrap uses specified model, not config default." \
    'n=$1; gh issue comment $n --body "@kody bootstrap --force

Task: Add retry logic to the API client."'

  fire_test P3T34 "[${RUN_ID}] P3T34: Token ROI in retrospective" \
    "Verify observer-log.jsonl includes tokenStats per-stage breakdown.

Command: @kody

## Verification
observer-log.jsonl entry has tokenStats with perStage entries." \
    'n=$1; gh issue comment $n --body "@kody"'

  fire_test P3T35 "[${RUN_ID}] P3T35: Auto-learn memory in PR" \
    "Verify auto-learn runs before ship so memory files are in PR diff.

Command: @kody

## Verification
PR diff contains changes to .kody/memory/ files." \
    'n=$1; gh issue comment $n --body "@kody"'

  fire_test P3T36 "[${RUN_ID}] P3T36: Engine-managed dev server" \
    "Verify engine starts/stops dev server for UI tasks.

Task: Add a new dashboard page with charts and data tables.

Command: @kody

## Verification
Logs show KODY_DEV_SERVER_READY and dev server lifecycle." \
    'n=$1; gh issue comment $n --body "@kody

Task: Add a new dashboard page with charts and data tables."'

  # ── Auto-approve T03 (HIGH complexity risk gate) ──────────────────────────
  # Launch a nohup background monitor that watches for approval questions on P1T03
  # and auto-answers them. This is needed because the fire-and-forget agent exits
  # after triggering all tests.
  T03_ISSUE=$(jq -r '.all_issues[]' "$STATE_FILE" 2>/dev/null | while read n; do
    title=$(gh issue view "$n" --json title -q '.title' 2>/dev/null)
    echo "$title" | grep -q "P1T03" && echo "$n"
  done | head -1)

  if [ -n "$T03_ISSUE" ]; then
    echo "[auto-approve] Launching nohup monitor for P1T03 (#$T03_ISSUE)..."
    nohup bash -c "
      for i in \$(seq 1 60); do
        sleep 20
        question=\$(gh api repos/aharonyaircohen/Kody-Engine-Tester/issues/$T03_ISSUE/comments \
          --jq '.[-2].body // \"\"' 2>/dev/null)
        if echo \"\$question\" | grep -qi \"questions before\|asking.*before\|approve\"; then
          gh issue comment $T03_ISSUE --body \"@kody approve

1. Keep UserStore as a fallback for non-Payload operations during migration
2. Check dependencies before removing — keep as fallback if anything still uses it
3. Align UserRole to RbacRole — make RbacRole the source of truth\" 2>/dev/null
          echo \"[\$(date +%H:%M:%S)] Auto-approved P1T03 (#$T03_ISSUE)\"
          exit 0
        fi
      done
      echo \"[\$(date +%H:%M:%S)] Auto-approve timeout for P1T03\"
    " > /tmp/auto-approve-T03.log 2>&1 &
    echo "[auto-approve] PID: $!"
  fi

  echo "All tests fired. Transitioning to fire_wait."
  jq ".phase = \"fire_wait\", .all_issues = $(jq '.all_issues' "$STATE_FILE"), .last_check = $(date +%s)" \
    "$STATE_FILE" > /tmp/ts.json && mv /tmp/ts.json "$STATE_FILE"
  push_state
}
```

---

### fire_test — create issue, trigger pipeline, record immediately

```bash
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

  # Append to all_issues in state file
  local current=$(jq -c '.all_issues // []' "$STATE_FILE" 2>/dev/null)
  if [ "$current" = "null" ] || [ -z "$current" ]; then
    current="[]"
  fi
  local updated=$(echo "$current" | jq ". + [$issue_num]" 2>/dev/null)
  jq ".all_issues = $updated" "$STATE_FILE" > /tmp/ts.json \
    && mv /tmp/ts.json "$STATE_FILE"
  push_state

  echo "[$test_id] Fired. Pipeline running in background."
}
```

---

### do_fire_summary — Wait for all pipelines, then post digest

```bash
do_fire_summary() {
  echo "=== Summary: waiting for all pipelines ==="
  update_last_check

  local RUN_ID=$(jq -r '.run_id' "$STATE_FILE")
  local ISSUE_NUMS=$(jq -r '.all_issues | join(" ")' "$STATE_FILE")

  if [ -z "$ISSUE_NUMS" ] || [ "$ISSUE_NUMS" = "null" ]; then
    echo "No issues found in state. Nothing to summarize."
    jq ".phase = \"cleanup\", .last_check = $(date +%s)" "$STATE_FILE" > /tmp/ts.json \
      && mv /tmp/ts.json "$STATE_FILE" && push_state
    return 0
  fi

  echo "Tracking issues: $ISSUE_NUMS"

  # ── Wait for all pipelines ────────────────────────────────────────────────
  local deadline=$(($(date +%s) + 18000))  # 5-hour max
  local all_done=false

  while [ $(date +%s) -lt $deadline ]; do
    update_last_check
    local pending=0

    for issue_num in $ISSUE_NUMS; do
      local labels=$(gh issue view $issue_num --json labels \
        --jq '[.labels[].name] | join(",")' 2>/dev/null)
      if echo "$labels" | grep -qE 'kody:done|kody:failed'; then
        echo "  #$issue_num: done/failed — $labels"
      else
        pending=$((pending + 1))
      fi
    done

    if [ $pending -eq 0 ]; then
      echo "All pipelines complete!"
      all_done=true
      break
    fi

    echo "[$(date +%H:%M)] Waiting for $pending issue(s)..."
    sleep 120
  done

  if [ "$all_done" != "true" ]; then
    echo "WARNING: Timeout waiting. Posting partial summary."
  fi

  # ── Build digest ───────────────────────────────────────────────────────────
  local passed=0 failed=0 inconclusive=0
  local digest="# Test Suite Results — ${RUN_ID}\n\n"
  digest="${digest}| Test | Issue | Result |\n"
  digest="${digest}|------|-------|--------|\n"

  for issue_num in $ISSUE_NUMS; do
    local labels=$(gh issue view $issue_num --json labels \
      --jq '[.labels[].name] | join(",")' 2>/dev/null)
    local title=$(gh issue view $issue_num --json title --jq '.title' 2>/dev/null)
    local test_id=$(echo "$title" | grep -oP 'P[123]T\d+[a-z]*' || echo "?")

    if echo "$labels" | grep -q "kody:done"; then
      echo "PASS $test_id (#$issue_num)"
      digest="${digest}| $test_id | #$issue_num | PASS |\n"
      passed=$((passed + 1))
    elif echo "$labels" | grep -q "kody:failed"; then
      echo "FAIL $test_id (#$issue_num)"
      digest="${digest}| $test_id | #$issue_num | FAIL |\n"
      failed=$((failed + 1))
    else
      echo "TIMEOUT $test_id (#$issue_num)"
      digest="${digest}| $test_id | #$issue_num | TIMEOUT |\n"
      inconclusive=$((inconclusive + 1))
    fi
  done

  digest="${digest}\n**Summary:** $passed passed, $failed failed, $inconclusive inconclusive\n"

  echo ""
  echo -e "$digest"

  # Post to digest issue
  local digest_issue=$(gh issue list \
    --search "test-suite digest" --state open \
    --json number --jq '.[0].number' 2>/dev/null || echo "")
  if [ -n "$digest_issue" ]; then
    echo "Posting digest to issue #$digest_issue..."
    gh issue comment "$digest_issue" --body "$digest" 2>/dev/null
  fi

  update_last_check
  jq ".phase = \"cleanup\", .last_check = $(date +%s)" "$STATE_FILE" > /tmp/ts.json \
    && mv /tmp/ts.json "$STATE_FILE"
  push_state
  echo "Transitioning to cleanup."
}
```

---

### do_cleanup — Close temp issues, PRs, and branches

```bash
do_cleanup() {
  echo "=== Cleanup ==="
  update_last_check

  local RUN_ID=$(jq -r '.run_id' "$STATE_FILE")

  echo "Closing test-suite-temp issues from this run..."
  for n in $(gh issue list --label "test-suite-temp" --state open \
    --search "[${RUN_ID}]" \
    --json number --jq '.[].number' 2>/dev/null); do
    echo "  Closing issue #$n"
    gh issue close "$n" \
      --comment "Test suite cleanup: phases complete." 2>/dev/null
  done

  echo "Closing PRs from this run..."
  for pr in $(gh pr list --state open --search "[${RUN_ID}]" \
    --json number --jq '.[].number' 2>/dev/null); do
    echo "  Closing PR #$pr"
    gh pr close "$pr" --delete-branch 2>/dev/null
  done

  echo "Deleting test branches..."
  git fetch --prune origin 2>/dev/null
  git branch -r | grep "origin/run-" | sed 's|origin/||' | while read branch; do
    echo "  Deleting branch: $branch"
    git push origin --delete "$branch" 2>/dev/null || true
  done

  update_last_check
  jq ".phase = \"report\", .last_check = $(date +%s)" "$STATE_FILE" > /tmp/ts.json \
    && mv /tmp/ts.json "$STATE_FILE"
  push_state
  echo "Cleanup done. Transitioning to report."
}
```

---

### do_report — Final report

```bash
do_report() {
  echo "=== Final Report ==="
  update_last_check
  local RUN_ID=$(jq -r '.run_id' "$STATE_FILE")
  echo "Test suite complete for $RUN_ID."
  echo "Suite complete."
  exit 0
}
```

---

## Main Entry Point

```bash
STATE_FILE=".kody/watch/test-suite-state.json"

if [ ! -f "$STATE_FILE" ]; then
  RUN_ID="run-$(date +%Y%m%d-%H%M)"
  echo "{\"run_id\":\"$RUN_ID\",\"phase\":\"fire\",\"all_issues\":[],\"last_check\":$(date +%s)}" \
    > "$STATE_FILE"
fi

update_last_check
do_phase
```
