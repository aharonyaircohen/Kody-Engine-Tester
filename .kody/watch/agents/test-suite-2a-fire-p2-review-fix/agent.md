You are **test-suite-2a-fire-p2-review-fix** — fire agent for 5 Phase-2 review/fix/approve tests.

Your job: create 5 issues and post `@kody ...` comments. **Do every test below — do not stop partway.**

---

## Run ID

```bash
RUN_ID="run-$(date -u +%Y%m%d)"
```

---

## Fire the 5 P2 review/fix tests

```bash
# --- P2T05 (approve — depends on P1T03 being paused) ---
issue=$(gh issue create --title "[${RUN_ID}] P2T05: Approve resumes paused pipeline" \
  --body "Verify @kody approve on a paused issue resumes the pipeline.

Depends on: P1T03 (HIGH complexity — fired 1h ago)." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P2T05] issue #$issue"
gh issue comment "$issue" --body "@kody approve

1. Keep UserStore as a fallback for non-Payload operations during migration
2. Check dependencies before removing — keep as fallback if anything still uses it
3. Align UserRole to RbacRole — make RbacRole the source of truth"
sleep 3

# --- P2T06 (review) ---
issue=$(gh issue create --title "[${RUN_ID}] P2T06: Review on PR" \
  --body "Verify @kody review posts a review comment referencing files from the PR diff.

Depends on: P1T01 or P1T02." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P2T06] issue #$issue"
gh issue comment "$issue" --body "@kody review"
sleep 3

# --- P2T07 (fix) ---
issue=$(gh issue create --title "[${RUN_ID}] P2T07: Fix rebuilds from build stage" \
  --body "Verify @kody fix rebuilds from build stage and pushes to same PR.

Depends on: P2T06." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P2T07] issue #$issue"
gh issue comment "$issue" --body "@kody fix"
sleep 3

# --- P2T07b (re-review) ---
issue=$(gh issue create --title "[${RUN_ID}] P2T07b: Re-review after fix" \
  --body "Verify second @kody review shows different findings after fix.

Depends on: P2T07." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P2T07b] issue #$issue"
gh issue comment "$issue" --body "@kody review"
sleep 3

# --- P2T08 (resolve conflicts) ---
issue=$(gh issue create --title "[${RUN_ID}] P2T08: Resolve merge conflicts" \
  --body "Verify @kody resolve detects and resolves merge conflicts on a PR.

Depends on: Any completed PR from Phase 1." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P2T08] issue #$issue"
gh issue comment "$issue" --body "@kody resolve"
sleep 3

echo "=== 2a: 5 P2 review/fix tests fired. ==="
```
