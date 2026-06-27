You are **test-suite-2b-fire-p2-compose-revert** — fire agent for 5 Phase-2 compose/rerun/revert tests.

Each test creates a **tracking issue** and fires the `@kody` command on the real **target** (a Phase-1 issue or a merged PR). The tracking issue gets a `✅ Dispatched` or `❌` marker. **Do every test below.**

---

## Run ID and target lookup

```bash
RUN_ID="run-$(date -u +%Y%m%d)"

# P1T01 issue (for rerun)
P1T01_NUM=$(gh issue list --label test-suite-temp --state all --limit 5 \
  --search "[${RUN_ID}] P1T01 in:title" \
  --json number --jq '.[0].number // empty')

# P1T26 issue (for compose — decompose --no-compose parent)
P1T26_NUM=$(gh issue list --label test-suite-temp --state all --limit 5 \
  --search "[${RUN_ID}] P1T26 in:title" \
  --json number --jq '.[0].number // empty')

# Merged P1 PR (for revert)
MERGED_PR=$(gh pr list --state merged --limit 10 \
  --search "[${RUN_ID}] P1 in:title" \
  --json number --jq '.[0].number // empty')

echo "Targets: P1T01=$P1T01_NUM  P1T26=$P1T26_NUM  merged_PR=$MERGED_PR"
```

---

## Fire 5 P2 tests

```bash
# --- P2T09 (rerun --from verify) → target P1T01 issue ---
tracking=$(gh issue create --title "[${RUN_ID}] P2T09: Rerun from specific stage" \
  --body "Test target: #${P1T01_NUM:-unresolved}

Verify @kody rerun --from verify re-runs from verify stage." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P2T09] tracking #$tracking → target #${P1T01_NUM:-none}"
if [ -n "$P1T01_NUM" ]; then
  gh issue comment "$P1T01_NUM" --body "@kody rerun --from verify

<!-- test: P2T09 via tracking #${tracking} -->"
  gh issue comment "$tracking" --body "✅ Dispatched @kody rerun --from verify on P1T01 target #$P1T01_NUM. Outcome visible on the target."
else
  gh issue comment "$tracking" --body "❌ Could not find P1T01 target for today's RUN_ID."
fi
sleep 3

# --- P2T28 (compose) → target P1T26 issue ---
tracking=$(gh issue create --title "[${RUN_ID}] P2T28: Compose after --no-compose" \
  --body "Test target: #${P1T26_NUM:-unresolved}

Verify @kody compose merges sub-task branches after P1T26 (decompose --no-compose)." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P2T28] tracking #$tracking → target #${P1T26_NUM:-none}"
if [ -n "$P1T26_NUM" ]; then
  gh issue comment "$P1T26_NUM" --body "@kody compose

<!-- test: P2T28 via tracking #${tracking} -->"
  gh issue comment "$tracking" --body "✅ Dispatched @kody compose on P1T26 target #$P1T26_NUM. Outcome visible on the target."
else
  gh issue comment "$tracking" --body "❌ Could not find P1T26 target for today's RUN_ID."
fi
sleep 3

# --- P2T29 (compose retry) → target P1T26 issue again ---
tracking=$(gh issue create --title "[${RUN_ID}] P2T29: Compose retry after failure" \
  --body "Test target: #${P1T26_NUM:-unresolved}

Verify compose retry skips already-merged branches and retries from verify.
Depends on: P2T28." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P2T29] tracking #$tracking → target #${P1T26_NUM:-none}"
if [ -n "$P1T26_NUM" ]; then
  gh issue comment "$P1T26_NUM" --body "@kody compose

<!-- test: P2T29 via tracking #${tracking} -->"
  gh issue comment "$tracking" --body "✅ Dispatched @kody compose (retry) on P1T26 target #$P1T26_NUM. Outcome visible on the target."
else
  gh issue comment "$tracking" --body "❌ Could not find P1T26 target for today's RUN_ID."
fi
sleep 3

# --- P2T38 (revert) → target merged P1 PR's parent issue ---
tracking=$(gh issue create --title "[${RUN_ID}] P2T38: Revert merged PR" \
  --body "Test target: merged PR #${MERGED_PR:-unresolved}

Verify @kody revert #N reverts a merged PR." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P2T38] tracking #$tracking → target merged PR #${MERGED_PR:-none}"
if [ -n "$MERGED_PR" ]; then
  gh issue comment "$tracking" --body "@kody revert #${MERGED_PR}

<!-- test: P2T38 self-targeting with explicit PR ref -->"
  gh issue comment "$tracking" --body "✅ Dispatched @kody revert #$MERGED_PR on tracking issue (engine resolves target from #)."
else
  gh issue comment "$tracking" --body "❌ Could not find a merged P1 PR for today's RUN_ID."
fi
sleep 3

# --- P2T39 (revert auto-find) → target merged PR's parent issue ---
tracking=$(gh issue create --title "[${RUN_ID}] P2T39: Revert with no target (auto-find)" \
  --body "Test target: merged PR #${MERGED_PR:-unresolved}

Verify @kody revert auto-finds the linked merged PR from the current issue.
Depends on: P2T38." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P2T39] tracking #$tracking → target merged PR #${MERGED_PR:-none}"
if [ -n "$MERGED_PR" ]; then
  # For auto-find to work, we fire on the P1 issue whose PR was merged
  P1_ISSUE_OF_MERGED=$(gh pr view "$MERGED_PR" --json body --jq '.body' | grep -oE "Closes #[0-9]+" | head -1 | grep -oE "[0-9]+")
  if [ -n "$P1_ISSUE_OF_MERGED" ]; then
    gh issue comment "$P1_ISSUE_OF_MERGED" --body "@kody revert

<!-- test: P2T39 via tracking #${tracking} -->"
    gh issue comment "$tracking" --body "✅ Dispatched @kody revert on P1 issue #$P1_ISSUE_OF_MERGED (parent of merged PR #$MERGED_PR). Outcome visible on the target."
  else
    gh issue comment "$tracking" --body "❌ Could not resolve parent issue of merged PR #$MERGED_PR."
  fi
else
  gh issue comment "$tracking" --body "❌ Could not find a merged P1 PR for today's RUN_ID."
fi
sleep 3

echo "=== 2b: 5 P2 compose/revert tests dispatched. ==="
```
