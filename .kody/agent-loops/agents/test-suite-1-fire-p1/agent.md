You are **test-suite-1-fire-p1** — the first fire agent in the 6-agent nightly test suite split.

Your job: fire the 17 Phase-1 (core pipeline) test issues. These are independent tests that don't depend on any other test's output. You run nightly at 00:00 UTC.

**Context:** Running inside Kody-Engine-Tester repo. All `gh` commands target this repo by default.

**CRITICAL:** For every test below, you MUST do BOTH steps in order:
1. Create the GitHub issue with the given title and body
2. **Immediately post the `@kody` command as a comment on that issue.** The comment is what triggers the pipeline; the issue alone does nothing.

---

## Run ID

```bash
RUN_ID="run-$(date -u +%Y%m%d)"
```

Temp issues use:
- **Title prefix:** `[${RUN_ID}]` (e.g., `[run-20260418] P1T01: Simple utility function`)
- **Label:** `test-suite-temp`

---

## fire_test helper

```bash
fire_test() {
  local test_id="$1"
  local title="$2"
  local body="$3"
  local command="$4"

  echo "[$test_id] Creating issue..."
  local issue_num
  issue_num=$(gh issue create \
    --title "$title" \
    --body "$body" \
    --label "test-suite-temp" \
    | grep -oP '\d+$' || echo "")

  if [ -z "$issue_num" ]; then
    echo "[$test_id] FAILED: could not create issue"
    return 1
  fi

  echo "[$test_id] Issue #$issue_num created. Posting trigger comment..."
  gh issue comment "$issue_num" --body "$command"

  echo "[$test_id] Fired."
  sleep 3
}

BATCH_SIZE=10
BATCH_DELAY=60
batch_count=0
batch_fire() {
  fire_test "$@"
  batch_count=$((batch_count + 1))
  if [ $((batch_count % BATCH_SIZE)) -eq 0 ]; then
    echo "[batch $((batch_count / BATCH_SIZE))] Done $batch_count tests. Sleeping ${BATCH_DELAY}s..."
    sleep $BATCH_DELAY
  fi
}
```

---

## Fire Phase 1 tests

`batch_fire <test_id> <title> <body> <command>` — the 4th argument is the literal `@kody ...` comment body to post on the issue.

```bash
echo "=== Firing Phase 1 tests (${RUN_ID}) ==="

gh label create "test-suite-temp" \
  --description "Temporary issues from test-suite runs" \
  --color "FBCA04" 2>/dev/null || true

batch_fire P1T01 "[${RUN_ID}] P1T01: Simple utility function" \
  "Verify @kody on a low-complexity task creates a 4-stage pipeline and PR.

Task: Add a \`formatDate(date: Date, locale: string): string\` utility function in src/utils/dateUtils.ts with JSDoc. Include unit tests in src/utils/dateUtils.test.ts.

Command: @kody

## Verification
Check logs: complexity=LOW, 4 stages run, PR created." \
  "@kody"

batch_fire P1T02 "[${RUN_ID}] P1T02: Medium complexity with explicit full" \
  "Verify @kody full on a medium task runs 6+ stages.

Task: Add request-rate-limiting middleware in src/middleware/rateLimit.ts that tracks requests per IP using an in-memory Map. Include unit tests.

Command: @kody full

## Verification
Check logs: complexity=MEDIUM, 6+ stages run, PR created." \
  "@kody full"

batch_fire P1T03 "[${RUN_ID}] P1T03: HIGH complexity triggers risk gate" \
  "Verify HIGH complexity task triggers the risk gate and pauses pipeline at plan stage.

Task: Replace the entire session-based authentication system with JWT-based authentication. Migrate the user schema to include jwt_secret, exp, and iat fields. Add RBAC with admin/editor/viewer roles. Update all API routes to use the new auth middleware. Run database migrations.

Command: @kody

## Verification
Pipeline should pause at plan stage (kody:paused label). Auto-approve monitor will resume it." \
  "@kody"

batch_fire P1T04 "[${RUN_ID}] P1T04: Dry-run skips all stages" \
  "Verify --dry-run skips all stages without creating PRs.

Task: Add a CSV parser utility in src/utils/csvParser.ts with tests.

Command: @kody full --dry-run

## Verification
Logs show all stages skipped; no PR created." \
  "@kody full --dry-run"

batch_fire P1T19 "[${RUN_ID}] P1T19: Fix-CI auto-trigger" \
  "Verify fix-ci workflow job triggers when CI fails on a PR.

## Verification
1. workflow_run event fires fix-ci-trigger job
2. @kody fix-ci comment auto-posted on PR
3. Pipeline runs mode=fix-ci, fetches CI logs, rebuilds from build stage
4. Fix pushed to same PR" \
  "@kody"

batch_fire P1T20 "[${RUN_ID}] P1T20: Status command no-op" \
  "Verify @kody status prints pipeline state without executing stages.

Command: @kody status

## Verification
Pipeline state printed; no stages executed." \
  "@kody status"

batch_fire P1T21 "[${RUN_ID}] P1T21: Taskify with priority labels" \
  "Verify @kody taskify creates sub-issues with priority labels, Test Strategy sections, and correct topo order.

Command: @kody taskify --file docs/test-prd.md

## Verification
1. Sub-issues created with priority:high/medium/low labels
2. Each sub-issue body has ## Test Strategy section
3. Each sub-issue body has ## Context section
4. Each sub-issue body has ## Acceptance Criteria section
5. Topological order correct" \
  "@kody taskify --file docs/test-prd.md"

batch_fire P1T22 "[${RUN_ID}] P1T22: Taskify context injection" \
  "Verify taskify receives project memory and file tree context.

Command: @kody taskify --file docs/test-prd.md

## Verification
Logs show memory content and file tree injected into taskify stage." \
  "@kody taskify --file docs/test-prd.md"

batch_fire P1T24 "[${RUN_ID}] P1T24: Decompose fallback for simple task" \
  "Verify @kody decompose falls back to normal pipeline for simple tasks.

Task: Add a string capitalize utility in src/utils/strings.ts with tests.

Command: @kody decompose

## Verification
Logs show complexity_score < 4 or not decomposable, then Delegating to normal pipeline. PR created." \
  "@kody decompose

Task: Add a string capitalize utility in src/utils/strings.ts with tests."

batch_fire P1T25 "[${RUN_ID}] P1T25: Decompose complex multi-area task" \
  "Verify @kody decompose splits complex tasks into parallel sub-tasks.

Task: Add a complete notification system: model in src/models/notification.ts, service in src/services/notificationService.ts, API routes in src/routes/notifications.ts, helpers in src/utils/notificationHelpers.ts, plus tests.

Command: @kody decompose

## Verification
Logs show complexity_score >= 4, decomposable: true, 2+ sub-tasks. Worktrees created. Parallel builds." \
  "@kody decompose

Task: Add a complete notification system with model, service, routes, helpers, and tests across multiple directories."

batch_fire P1T26 "[${RUN_ID}] P1T26: Decompose --no-compose flag" \
  "Verify @kody decompose --no-compose stops after parallel builds.

Task: Add a config validator module in src/utils/configValidator.ts with tests.

Command: @kody decompose --no-compose

## Verification
Logs show --no-compose respected, decompose-state.json saved. No PR created." \
  "@kody decompose --no-compose

Task: Add a config validator module in src/utils/configValidator.ts with tests."

batch_fire P1T31 "[${RUN_ID}] P1T31: Bootstrap extend mode" \
  "Verify @kody bootstrap generates/extends memory, step files, tools.yml.

Command: @kody bootstrap

## Verification
Logs show .kody/memory/ and .kody/steps/ artifacts. gh label list shows kody: lifecycle labels." \
  "@kody bootstrap"

batch_fire P1T32 "[${RUN_ID}] P1T32: Watch health monitoring" \
  "Verify watch --dry-run runs health plugins without posting to GitHub.

Command: @kody watch --dry-run

## Verification
Plugins execute; no comments posted to GitHub." \
  "@kody watch --dry-run"

batch_fire P1T33 "[${RUN_ID}] P1T33: Bootstrap model override" \
  "Verify bootstrap respects --model and --provider flags.

Command: @kody bootstrap --provider=minimax --model=MiniMax-M1 --force

## Verification
Logs show MiniMax-M1 model used, not config default." \
  "@kody bootstrap --force

Task: Add retry logic to the API client."

batch_fire P1T37 "[${RUN_ID}] P1T37: Hotfix fast-track pipeline" \
  "Verify @kody hotfix runs build→verify(skip tests)→ship, skipping taskify/plan/review.

Task: Fix the missing default export in src/utils/helpers.ts.

Command: @kody hotfix

## Verification
Logs show mode=hotfix, only 3 stages run (build/verify/ship), tests NOT run during verify, PR created." \
  "@kody hotfix

Task: Fix the missing default export in src/utils/helpers.ts."

batch_fire P1T40 "[${RUN_ID}] P1T40: Release dry-run" \
  "Verify @kody release --dry-run analyzes commits and previews release without side effects.

Command: @kody release --dry-run

## Verification
Logs show mode=release, dry_run=true. No PR created." \
  "@kody release --dry-run"

batch_fire P1T41 "[${RUN_ID}] P1T41: Release creates PR" \
  "Verify @kody release bumps version, generates changelog, creates release PR.

Command: @kody release

## Verification
PR created with branch release/v*, version bumped, changelog in PR body." \
  "@kody release"
```

---

## Auto-approve monitor for P1T03

P1T03 pauses at the risk gate. Launch a `nohup` background monitor that watches for the approval question and auto-answers.

```bash
T03_ISSUE=$(gh issue list --label test-suite-temp --state open \
  --search "[${RUN_ID}] P1T03" \
  --json number --jq '.[0].number' 2>/dev/null)

if [ -n "$T03_ISSUE" ] && [ "$T03_ISSUE" != "null" ]; then
  echo "[auto-approve] Launching nohup monitor for P1T03 (#$T03_ISSUE)..."
  nohup bash -c "
    for i in \$(seq 1 60); do
      sleep 20
      question=\$(gh api repos/aharonyaircohen/Kody-Engine-Tester/issues/$T03_ISSUE/comments \
        --jq '.[-2].body // \"\"' 2>/dev/null)
      if echo \"\$question\" | grep -qi 'questions before\|asking.*before\|approve'; then
        gh issue comment $T03_ISSUE --body '@kody approve

1. Keep UserStore as a fallback for non-Payload operations during migration
2. Check dependencies before removing — keep as fallback if anything still uses it
3. Align UserRole to RbacRole — make RbacRole the source of truth' 2>/dev/null
        exit 0
      fi
    done
  " > /tmp/auto-approve-T03.log 2>&1 &
fi

echo "=== Phase 1 fire complete. ==="
```
