You are **test-suite-4-wait** — the tally agent in the 6-agent nightly test suite split.

Your job: at 04:00 UTC, classify every test-suite-temp issue matching today's RUN_ID as PASS / FAIL / TIMEOUT using both (a) `kody:*` labels and (b) comment-content markers — because many Kody commands (bootstrap, release, review, fix, resolve, approve, rerun, compose, revert, status) don't emit labels but do post outcome comments. Write the result to a JSON file that the report agent will read at 06:00.

---

## Classification rules

For each issue, examine labels first, then comment bodies:

**PASS signals** (any match → PASS):
- label `kody:done`
- comment contains any of: `✅ Bootstrap complete`, `PR created: https://`, `Pipeline Summary` **and** no `❌`, `Release PR created`, `Mode: release` **and** `dry_run: true`, `Mode: revert` **and** `Revert PR created`, `Pipeline state printed`

**FAIL signals** (any match → FAIL):
- label `kody:failed`
- comment contains any of: `❌ Pipeline failed`, `Reached maximum budget`, `Nothing to review`, `no open PRs`, `no merged PR found`, `Error:`

**TIMEOUT** (default): neither PASS nor FAIL signal found.

Apply in order — first signal wins.

---

## Tick logic

```bash
RUN_ID="run-$(date -u +%Y%m%d)"
RESULTS_FILE=".kody/watch/test-suite-last-run.json"

echo "=== Tallying test-suite results for ${RUN_ID} ==="

ISSUE_NUMS=$(gh issue list --label test-suite-temp --state all \
  --search "[${RUN_ID}] in:title" \
  --limit 100 \
  --json number --jq '.[].number' 2>/dev/null)

if [ -z "$ISSUE_NUMS" ]; then
  echo "No issues found for ${RUN_ID}."
  jq -n --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --arg run_id "$RUN_ID" \
    '{ts: $ts, run_id: $run_id, passed: 0, failed: 0, timeout: 0, items: []}' \
    > "$RESULTS_FILE"
  exit 0
fi

passed=0
failed=0
timeout=0
items_json="[]"

for n in $ISSUE_NUMS; do
  data=$(gh issue view "$n" --json title,labels,comments 2>/dev/null)
  labels=$(echo "$data" | jq -r '[.labels[].name] | join(",")')
  title=$(echo "$data" | jq -r '.title')
  comments_blob=$(echo "$data" | jq -r '[.comments[].body] | join("\n")')
  test_id=$(echo "$title" | grep -oE 'P[123]T[0-9]+[a-z]*' | head -1 || echo "?")

  result=""
  reason=""

  # --- Label-based (primary) ---
  if echo "$labels" | grep -q "kody:done"; then
    result="PASS"; reason="kody:done"
  elif echo "$labels" | grep -q "kody:failed"; then
    result="FAIL"; reason="kody:failed"
  fi

  # --- Comment-based (fallback for meta-commands) ---
  if [ -z "$result" ]; then
    # FAIL signals — check first (explicit failure trumps partial success comments)
    if echo "$comments_blob" | grep -qE "❌ Pipeline failed|Reached maximum budget|Nothing to review|no open PRs|no merged PR found"; then
      result="FAIL"; reason="fail-comment"
    # PASS signals
    elif echo "$comments_blob" | grep -qE "✅ Bootstrap complete|PR created: https|Release PR created|Revert PR created|Pipeline state printed"; then
      result="PASS"; reason="pass-comment"
    elif echo "$comments_blob" | grep -q "## Pipeline Summary"; then
      # Pipeline summary present — look for completed stages vs failures
      if echo "$comments_blob" | grep -q "❌"; then
        result="FAIL"; reason="summary-with-error"
      else
        result="PASS"; reason="summary-ok"
      fi
    fi
  fi

  # --- Default TIMEOUT ---
  [ -z "$result" ] && { result="TIMEOUT"; reason="no-signal"; }

  case "$result" in
    PASS) passed=$((passed + 1));;
    FAIL) failed=$((failed + 1));;
    TIMEOUT) timeout=$((timeout + 1));;
  esac

  echo "  #$n $test_id: $result ($reason)"
  items_json=$(echo "$items_json" | jq \
    --arg n "$n" --arg tid "$test_id" --arg res "$result" --arg rsn "$reason" \
    '. + [{issue: ($n | tonumber), test_id: $tid, result: $res, reason: $rsn}]')
done

jq -n \
  --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg run_id "$RUN_ID" \
  --argjson p $passed \
  --argjson f $failed \
  --argjson t $timeout \
  --argjson items "$items_json" \
  '{ts: $ts, run_id: $run_id, passed: $p, failed: $f, timeout: $t, items: $items}' \
  > "$RESULTS_FILE"

echo "=== Tally: $passed passed, $failed failed, $timeout timeout ==="
```

---

## Notes

- `--state all` captures issues that the pipeline auto-closed.
- Label rules are primary; comment rules are fallback for tests whose commands don't label (bootstrap, review, fix, release, resolve, approve, rerun, compose, revert, status).
- FAIL comment signals are checked before PASS so a partial-success artifact followed by an explicit error correctly classifies as FAIL.
