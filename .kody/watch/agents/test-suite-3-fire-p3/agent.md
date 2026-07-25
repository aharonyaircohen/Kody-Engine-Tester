You are **test-suite-3-fire-p3** — the third fire agent in the 6-agent nightly test suite split.

Your job: fire the 17 Phase-3 (complex features) test issues. Runs nightly at 02:00 UTC. Some P3 tests have two-step chains (P3T12, P3T13) handled by nohup monitors.

**Context:** Running inside Kody-Engine-Tester repo.

**CRITICAL:** For every test below, you MUST do BOTH steps in order:
1. Create the GitHub issue with the given title and body
2. **Immediately post the `@kody` command as a comment on that issue.** The comment is what triggers the pipeline.

---

## Run ID

```bash
RUN_ID="run-$(date -u +%Y%m%d)"
```

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

## Fire Phase 3 tests

```bash
echo "=== Firing Phase 3 tests (${RUN_ID}) ==="

batch_fire P3T10 "[${RUN_ID}] P3T10: --complexity override" \
  "Verify --complexity low flag forces 4 stages regardless of task complexity.

Command: @kody --complexity low

## Verification
Logs show Complexity override: low. 4 stages run." \
  "@kody --complexity low"

batch_fire P3T11 "[${RUN_ID}] P3T11: --feedback injection" \
  "Verify --feedback flag is injected into build stage.

Command: @kody --feedback \"Use functional style\"

## Verification
Logs show feedback: line during build stage." \
  "@kody --feedback \"Use functional style\""

batch_fire P3T12 "[${RUN_ID}] P3T12: --from stage flag" \
  "Two-step test: trigger @kody (pipeline starts), then after it completes fire @kody --from build.

Command (step 1): @kody

## Verification
Step 1: Pipeline completes normally.
Step 2: Logs show 'Resuming from: build' — taskify and plan stages skipped." \
  "@kody"

batch_fire P3T13 "[${RUN_ID}] P3T13: State bypass on rerun" \
  "Two-step test: trigger @kody (pipeline completes), then after it finishes fire @kody rerun.

Command (step 1): @kody

## Verification
Step 1: Pipeline completes with kody:done label.
Step 2: Pipeline re-executes (not blocked by 'already completed')." \
  "@kody"

batch_fire P3T14 "[${RUN_ID}] P3T14: Dry-run mode" \
  "Verify --dry-run skips all stages without creating PRs.

Command: @kody --dry-run

## Verification
Logs show all stages skipped; no PR created." \
  "@kody --dry-run"

batch_fire P3T15 "[${RUN_ID}] P3T15: PR title from issue title" \
  "Verify bare @kody uses issue title as PR title.

Command: @kody

## Verification
PR title matches issue title, not hardcoded." \
  "@kody"

batch_fire P3T16 "[${RUN_ID}] P3T16: Issue stays open after ship" \
  "Verify issue remains OPEN after PR is shipped.

Command: @kody

## Verification
Issue still OPEN after ship. PR is merged." \
  "@kody"

batch_fire P3T17 "[${RUN_ID}] P3T17: Special characters in feedback" \
  "Verify special characters handled without shell injection.

Command: @kody --feedback 'Use \"quotes\" and handle \$(dollar) signs'

## Verification
Pipeline completes without bad substitution errors." \
  "Please use \"quotes\" and handle \$(dollar) signs"

batch_fire P3T18 "[${RUN_ID}] P3T18: UI task gets Playwright MCP" \
  "Verify UI tasks get Playwright MCP auto-injected.

Task: Add a dashboard page with charts and data tables.

Command: @kody

## Verification
task.json has hasUI: true; logs show MCP config injection." \
  "@kody

Task: Add a new dashboard page with charts and data tables."

batch_fire P3T19 "[${RUN_ID}] P3T19: Force-with-lease retry on rerun push" \
  "Verify force-with-lease retry when push is rejected during rerun.

## Verification
Logs show force-with-lease on push retry. Either outcome accepted." \
  "@kody"

batch_fire P3T23 "[${RUN_ID}] P3T23: Issue attachments and metadata enrichment" \
  "Verify image attachments are downloaded and labels/comments enrich task.md.

## Verification
1. Logs show 'Downloaded attachment:' and task.md has local paths
2. If image URL unreachable, verify graceful fallback
3. PASS: attachments/ downloaded, Labels: and Discussion: sections present" \
  "@kody

Task: Add a footer component.

## Design
![mockup](https://github.com/user-attachments/assets/test-uuid/footer-design.png)"

batch_fire P3T27 "[${RUN_ID}] P3T27: Decompose with config disabled" \
  "Verify decompose.enabled=false causes immediate fallback to normal pipeline.

Command: @kody decompose

## Verification
Logs should show 'decompose disabled in config — falling back'." \
  "@kody decompose

Task: Add pagination to the course list page."

batch_fire P3T30 "[${RUN_ID}] P3T30: Decompose sub-task failure triggers fallback" \
  "Verify sub-task failure in decompose triggers worktree cleanup and fallback.

Command: @kody decompose

## Verification
Logs show sub-task failure detected, worktrees cleaned up, fallback to runPipeline()." \
  "@kody decompose

Task: Implement a caching system: Redis adapter in src/cache/redisAdapter.ts (requires ioredis NOT installed), in-memory adapter, cache manager."

batch_fire P3T33b "[${RUN_ID}] P3T33b: Lifecycle label progression" \
  "Verify lifecycle labels progress through planning→building→verifying→review→done.

Command: @kody

## Verification
Label history shows correct progression." \
  "@kody"

batch_fire P3T34 "[${RUN_ID}] P3T34: Token ROI in retrospective" \
  "Verify retrospective.md includes token usage and ROI metrics.

Command: @kody

## Verification
retrospective.md file has Token ROI section." \
  "@kody"

batch_fire P3T35 "[${RUN_ID}] P3T35: Auto-learn memory in PR" \
  "Verify auto-learned memory is attached to PR.

Command: @kody

## Verification
PR body contains auto-learn memory section." \
  "@kody"

batch_fire P3T36 "[${RUN_ID}] P3T36: Engine-managed dev server" \
  "Verify engine starts/stops dev server for UI tasks.

Task: Add a new dashboard page with charts and data tables.

Command: @kody

## Verification
Logs show KODY_DEV_SERVER_READY and dev server lifecycle." \
  "@kody

Task: Add a new dashboard page with charts and data tables."
```

---

## Second-step monitors (P3T12, P3T13)

```bash
P3T12_ISSUE=$(gh issue list --label test-suite-temp --state open \
  --search "[${RUN_ID}] P3T12" \
  --json number --jq '.[0].number' 2>/dev/null)

if [ -n "$P3T12_ISSUE" ] && [ "$P3T12_ISSUE" != "null" ]; then
  nohup bash -c "
    for i in \$(seq 1 60); do
      sleep 30
      labels=\$(gh issue view $P3T12_ISSUE --json labels --jq '[.labels[].name] | join(\",\")' 2>/dev/null)
      if echo \"\$labels\" | grep -qE 'kody:done|kody:failed'; then
        gh issue comment $P3T12_ISSUE --body '@kody --from build' 2>/dev/null
        exit 0
      fi
    done
  " > /tmp/P3T12-step2.log 2>&1 &
fi

P3T13_ISSUE=$(gh issue list --label test-suite-temp --state open \
  --search "[${RUN_ID}] P3T13" \
  --json number --jq '.[0].number' 2>/dev/null)

if [ -n "$P3T13_ISSUE" ] && [ "$P3T13_ISSUE" != "null" ]; then
  nohup bash -c "
    for i in \$(seq 1 60); do
      sleep 30
      labels=\$(gh issue view $P3T13_ISSUE --json labels --jq '[.labels[].name] | join(\",\")' 2>/dev/null)
      if echo \"\$labels\" | grep -qE 'kody:done|kody:failed'; then
        gh issue comment $P3T13_ISSUE --body '@kody rerun' 2>/dev/null
        exit 0
      fi
    done
  " > /tmp/P3T13-step2.log 2>&1 &
fi

echo "=== Phase 3 fire complete. ==="
```
