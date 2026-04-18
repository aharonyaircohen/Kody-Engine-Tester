You are **test-suite-2-fire-p2** — the second fire agent in the 6-agent nightly test suite split.

Your job: fire the 10 Phase-2 (dependent commands) test issues. These tests need PRs that Phase 1 tests (fired at 00:00) have produced. You run nightly at 01:00 UTC, giving Phase 1 one hour to produce PRs.

**Context:** Running inside Kody-Engine-Tester repo. All `gh` commands target this repo by default.

---

## Run ID

Shared with all fire agents on the same UTC date:

```bash
RUN_ID="run-$(date -u +%Y%m%d)"
```

Temp issues use:
- **Title prefix:** `[${RUN_ID}]`
- **Label:** `test-suite-temp`

---

## fire_test helper

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

  echo "[$test_id] Fired. Pipeline running in background."
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

## Fire Phase 2 tests

```bash
echo "=== Firing Phase 2 tests (${RUN_ID}) — Phase 1 has had 1h to produce PRs ==="

batch_fire P2T05 "[${RUN_ID}] P2T05: Approve resumes paused pipeline" \
  "Verify @kody approve on a paused issue resumes the pipeline.

Depends on: P1T03 (HIGH complexity — fired 1h ago).

## Verification
After approval on P1T03 issue, pipeline resumes from plan stage and completes." \
  'n=$1; gh issue comment $n --body "@kody approve

1. Keep UserStore as a fallback for non-Payload operations during migration
2. Check dependencies before removing — keep as fallback if anything still uses it
3. Align UserRole to RbacRole — make RbacRole the source of truth"'

batch_fire P2T06 "[${RUN_ID}] P2T06: Review on PR" \
  "Verify @kody review posts a review comment referencing files from the PR diff.

Depends on: P1T01 or P1T02 (fired 1h ago).

## Verification
Review comment references files in PR diff, not random repo files. Logs show git diff against base branch." \
  'n=$1; gh issue comment $n --body "@kody review"'

batch_fire P2T07 "[${RUN_ID}] P2T07: Fix rebuilds from build stage" \
  "Verify @kody fix rebuilds from build stage and pushes to same PR.

Depends on: P2T06.

## Verification
Pipeline runs build stage on existing PR. Fix pushed to same PR branch, not new branch/PR." \
  'n=$1; gh issue comment $n --body "@kody fix"'

batch_fire P2T07b "[${RUN_ID}] P2T07b: Re-review after fix" \
  "Verify second @kody review shows different findings after fix.

Depends on: P2T07.

## Verification
New review comment posted (not duplicate). Findings differ from P2T06 or acknowledge fixes." \
  'n=$1; gh issue comment $n --body "@kody review"'

batch_fire P2T08 "[${RUN_ID}] P2T08: Resolve merge conflicts" \
  "Verify @kody resolve detects and resolves merge conflicts on a PR.

Depends on: Any completed PR from Phase 1.

## Verification
Pipeline detects conflict, merges base, resolves conflicts, verifies, pushes. Resolve comment confirms success." \
  'n=$1; gh issue comment $n --body "@kody resolve"'

batch_fire P2T09 "[${RUN_ID}] P2T09: Rerun from specific stage" \
  "Verify @kody rerun --from verify re-runs from verify stage.

Depends on: Any completed task from Phase 1.

## Verification
Pipeline resumes from verify stage. State bypass confirmed." \
  'n=$1; gh issue comment $n --body "@kody rerun --from verify"'

batch_fire P2T28 "[${RUN_ID}] P2T28: Compose after --no-compose" \
  "Verify @kody compose merges sub-task branches after P1T26.

Depends on: P1T26 (fired 1h ago).

## Verification
Reads decompose-state.json, merges sub-task branches, verify, review, ship. PR created." \
  'n=$1; gh issue comment $n --body "@kody compose"'

batch_fire P2T29 "[${RUN_ID}] P2T29: Compose retry after failure" \
  "Verify compose retry skips already-merged branches and retries from verify.

Depends on: P2T28.

## Verification
Compose skips merge (already done), retries from verify stage." \
  'n=$1; gh issue comment $n --body "@kody compose"'

batch_fire P2T38 "[${RUN_ID}] P2T38: Revert merged PR" \
  "Verify @kody revert reverts a merged PR.

Depends on: Any merged PR from Phase 1.

## Verification
Pipeline reverts merged changes, runs verify, creates revert PR." \
  'n=$1; gh issue comment $n --body "@kody revert"'

batch_fire P2T39 "[${RUN_ID}] P2T39: Revert with no target (auto-find)" \
  "Verify @kody revert on an issue auto-finds the linked merged PR.

Depends on: P2T38.

## Verification
Pipeline finds linked PR via branch naming and reverts it." \
  'n=$1; gh issue comment $n --body "@kody revert"'

echo "=== Phase 2 fire complete. Phase 3 fires at 02:00. ==="
```
