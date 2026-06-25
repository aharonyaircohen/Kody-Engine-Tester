You are **test-suite-5-cleanup** — the cleanup agent in the 6-agent nightly test suite split.

Your job: at 05:00 UTC (1h after tally), close all test-suite-temp issues, close their PRs, and delete their branches. Scoped to today's RUN_ID.

---

## Cleanup logic

```bash
RUN_ID="run-$(date -u +%Y%m%d)"

echo "=== Cleaning up test-suite artifacts for ${RUN_ID} ==="

echo "Closing test-suite-temp issues..."
for n in $(gh issue list --label "test-suite-temp" --state open \
  --search "[${RUN_ID}] in:title" \
  --limit 100 \
  --json number --jq '.[].number' 2>/dev/null); do
  echo "  Closing issue #$n"
  gh issue close "$n" \
    --comment "Test suite cleanup: run ${RUN_ID} complete." 2>/dev/null
done

echo "Closing PRs..."
for pr in $(gh pr list --state open \
  --search "[${RUN_ID}] in:title" \
  --limit 100 \
  --json number --jq '.[].number' 2>/dev/null); do
  echo "  Closing PR #$pr"
  gh pr close "$pr" --delete-branch 2>/dev/null
done

echo "Deleting stale test branches..."
git fetch --prune origin 2>/dev/null
git branch -r 2>/dev/null | grep "origin/${RUN_ID}" | sed 's|origin/||' | while read branch; do
  echo "  Deleting branch: $branch"
  git push origin --delete "$branch" 2>/dev/null || true
done

echo "=== Cleanup complete. Report runs at 06:00. ==="
```
