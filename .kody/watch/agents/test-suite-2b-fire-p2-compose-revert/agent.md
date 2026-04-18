You are **test-suite-2b-fire-p2-compose-revert** — fire agent for 5 Phase-2 compose/rerun/revert tests.

Your job: create 5 issues and post `@kody ...` comments. **Do every test below — do not stop partway.**

---

## Run ID

```bash
RUN_ID="run-$(date -u +%Y%m%d)"
```

---

## Fire the 5 P2 compose/revert tests

```bash
# --- P2T09 (rerun) ---
issue=$(gh issue create --title "[${RUN_ID}] P2T09: Rerun from specific stage" \
  --body "Verify @kody rerun --from verify re-runs from verify stage.

Depends on: Any completed task from Phase 1." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P2T09] issue #$issue"
gh issue comment "$issue" --body "@kody rerun --from verify"
sleep 3

# --- P2T28 (compose) ---
issue=$(gh issue create --title "[${RUN_ID}] P2T28: Compose after --no-compose" \
  --body "Verify @kody compose merges sub-task branches after P1T26.

Depends on: P1T26." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P2T28] issue #$issue"
gh issue comment "$issue" --body "@kody compose"
sleep 3

# --- P2T29 (compose retry) ---
issue=$(gh issue create --title "[${RUN_ID}] P2T29: Compose retry after failure" \
  --body "Verify compose retry skips already-merged branches and retries from verify.

Depends on: P2T28." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P2T29] issue #$issue"
gh issue comment "$issue" --body "@kody compose"
sleep 3

# --- P2T38 (revert) ---
issue=$(gh issue create --title "[${RUN_ID}] P2T38: Revert merged PR" \
  --body "Verify @kody revert reverts a merged PR.

Depends on: Any merged PR from Phase 1." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P2T38] issue #$issue"
gh issue comment "$issue" --body "@kody revert"
sleep 3

# --- P2T39 (revert auto-find) ---
issue=$(gh issue create --title "[${RUN_ID}] P2T39: Revert with no target (auto-find)" \
  --body "Verify @kody revert on an issue auto-finds the linked merged PR.

Depends on: P2T38." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P2T39] issue #$issue"
gh issue comment "$issue" --body "@kody revert"
sleep 3

echo "=== 2b: 5 P2 compose/revert tests fired. ==="
```
