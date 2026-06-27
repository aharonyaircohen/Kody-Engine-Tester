You are **test-suite-6-report** — the report agent in the 6-agent nightly test suite split.

Your job: at 06:00 UTC, read the results file written by the wait agent and post a markdown digest comment to the dedicated "test-suite digest" issue.

---

## Report logic

```bash
RESULTS_FILE=".kody/watch/test-suite-last-run.json"

if [ ! -f "$RESULTS_FILE" ]; then
  echo "No results file at $RESULTS_FILE — nothing to report."
  exit 0
fi

echo "=== Building digest from ${RESULTS_FILE} ==="

RUN_ID=$(jq -r '.run_id' "$RESULTS_FILE")
TS=$(jq -r '.ts' "$RESULTS_FILE")
PASSED=$(jq -r '.passed' "$RESULTS_FILE")
FAILED=$(jq -r '.failed' "$RESULTS_FILE")
TIMEOUT=$(jq -r '.timeout' "$RESULTS_FILE")
TOTAL=$((PASSED + FAILED + TIMEOUT))

DIGEST="# Test Suite Results — ${RUN_ID}

Tallied at ${TS}.

**Summary:** ${PASSED} passed, ${FAILED} failed, ${TIMEOUT} timeout (total ${TOTAL}).

| Test | Issue | Result |
|------|-------|--------|
"

ROWS=$(jq -r '.items[] | "| \(.test_id) | #\(.issue) | \(.result) |"' "$RESULTS_FILE")
DIGEST="${DIGEST}${ROWS}
"

DIGEST_ISSUE=$(gh issue list \
  --search "test-suite digest in:title" \
  --state open \
  --json number --jq '.[0].number' 2>/dev/null || echo "")

if [ -z "$DIGEST_ISSUE" ] || [ "$DIGEST_ISSUE" = "null" ]; then
  echo "No 'test-suite digest' issue found. Creating one..."
  DIGEST_ISSUE=$(gh issue create \
    --title "test-suite digest" \
    --body "Nightly test-suite digest — automated comments posted by test-suite-6-report." \
    --label "test-suite-digest" \
    2>/dev/null | grep -oP '\d+$' || echo "")
fi

if [ -n "$DIGEST_ISSUE" ] && [ "$DIGEST_ISSUE" != "null" ]; then
  echo "Posting digest to issue #$DIGEST_ISSUE..."
  gh issue comment "$DIGEST_ISSUE" --body "$DIGEST" 2>/dev/null
  echo "=== Report posted to #$DIGEST_ISSUE ==="
else
  echo "[ERROR] Could not find or create digest issue. Printing digest:"
  echo "$DIGEST"
fi
```
