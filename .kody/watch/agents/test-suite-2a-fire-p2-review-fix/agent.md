You are **test-suite-2a-fire-p2-review-fix** — fire agent for 5 Phase-2 review/fix/approve tests.

Your job: each test creates a **tracking issue** (for digest visibility) and fires the `@kody` command on the real **target** (a Phase-1 PR or issue). The tracking issue gets a `✅ Dispatched` or `❌` marker so the wait agent can classify it. **Do every test below — do not stop partway.**

---

## Run ID and target lookup

```bash
RUN_ID="run-$(date -u +%Y%m%d)"

# Find today's first open P1 PR (for review/fix)
P1_PR=$(gh pr list --state open --limit 10 \
  --search "[${RUN_ID}] P1 in:title" \
  --json number,title --jq '.[].number' | head -1)

# Find today's P1T03 issue (for approve)
P1T03_NUM=$(gh issue list --label test-suite-temp --state all --limit 5 \
  --search "[${RUN_ID}] P1T03 in:title" \
  --json number --jq '.[0].number // empty')

echo "Targets: P1_PR=$P1_PR  P1T03=$P1T03_NUM"
```

---

## Fire 5 P2 tests

```bash
# --- P2T05 (approve) → target P1T03 issue ---
tracking=$(gh issue create --title "[${RUN_ID}] P2T05: Approve resumes paused pipeline" \
  --body "Test target: #${P1T03_NUM:-unresolved}

Verify @kody approve on a paused issue resumes the pipeline.
Depends on: P1T03 (HIGH complexity)." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P2T05] tracking #$tracking → target #${P1T03_NUM:-none}"
if [ -n "$P1T03_NUM" ]; then
  gh issue comment "$P1T03_NUM" --body "@kody approve

1. Keep UserStore as a fallback for non-Payload operations during migration
2. Check dependencies before removing — keep as fallback if anything still uses it
3. Align UserRole to RbacRole — make RbacRole the source of truth

<!-- test: P2T05 via tracking #${tracking} -->"
  gh issue comment "$tracking" --body "✅ Dispatched @kody approve on P1T03 target #$P1T03_NUM. Outcome visible on the target."
else
  gh issue comment "$tracking" --body "❌ Could not find P1T03 target for today's RUN_ID."
fi
sleep 3

# --- P2T06 (review) → target P1 PR ---
tracking=$(gh issue create --title "[${RUN_ID}] P2T06: Review on PR" \
  --body "Test target: PR #${P1_PR:-unresolved}

Verify @kody review posts a review comment referencing files from the PR diff." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P2T06] tracking #$tracking → target PR #${P1_PR:-none}"
if [ -n "$P1_PR" ]; then
  gh pr comment "$P1_PR" --body "@kody review

<!-- test: P2T06 via tracking #${tracking} -->"
  gh issue comment "$tracking" --body "✅ Dispatched @kody review on PR #$P1_PR. Outcome visible on the PR."
else
  gh issue comment "$tracking" --body "❌ Could not find a P1 PR for today's RUN_ID."
fi
sleep 3

# --- P2T07 (fix) → target same P1 PR ---
tracking=$(gh issue create --title "[${RUN_ID}] P2T07: Fix rebuilds from build stage" \
  --body "Test target: PR #${P1_PR:-unresolved}

Verify @kody fix rebuilds from build stage and pushes to same PR.
Depends on: P2T06 having posted a review." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P2T07] tracking #$tracking → target PR #${P1_PR:-none}"
if [ -n "$P1_PR" ]; then
  gh pr comment "$P1_PR" --body "@kody fix

<!-- test: P2T07 via tracking #${tracking} -->"
  gh issue comment "$tracking" --body "✅ Dispatched @kody fix on PR #$P1_PR. Outcome visible on the PR."
else
  gh issue comment "$tracking" --body "❌ Could not find a P1 PR for today's RUN_ID."
fi
sleep 3

# --- P2T07b (re-review) → target same P1 PR ---
tracking=$(gh issue create --title "[${RUN_ID}] P2T07b: Re-review after fix" \
  --body "Test target: PR #${P1_PR:-unresolved}

Verify second @kody review shows different findings after fix.
Depends on: P2T07." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P2T07b] tracking #$tracking → target PR #${P1_PR:-none}"
if [ -n "$P1_PR" ]; then
  gh pr comment "$P1_PR" --body "@kody review

<!-- test: P2T07b via tracking #${tracking} -->"
  gh issue comment "$tracking" --body "✅ Dispatched @kody review (re-review) on PR #$P1_PR. Outcome visible on the PR."
else
  gh issue comment "$tracking" --body "❌ Could not find a P1 PR for today's RUN_ID."
fi
sleep 3

# --- P2T08 (resolve) → target any P1 PR (conflict setup not automated) ---
tracking=$(gh issue create --title "[${RUN_ID}] P2T08: Resolve merge conflicts" \
  --body "Test target: PR #${P1_PR:-unresolved}

Verify @kody resolve behavior on a PR. Conflict setup is not automated — this test
will likely respond 'no conflict' rather than actually resolving; that is still an
informative engine-response test." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P2T08] tracking #$tracking → target PR #${P1_PR:-none}"
if [ -n "$P1_PR" ]; then
  gh pr comment "$P1_PR" --body "@kody resolve

<!-- test: P2T08 via tracking #${tracking} -->"
  gh issue comment "$tracking" --body "✅ Dispatched @kody resolve on PR #$P1_PR. Outcome visible on the PR."
else
  gh issue comment "$tracking" --body "❌ Could not find a P1 PR for today's RUN_ID."
fi
sleep 3

echo "=== 2a: 5 P2 review/fix tests dispatched. ==="
```
