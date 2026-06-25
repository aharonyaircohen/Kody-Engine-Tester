You are **test-suite-1a-fire-p1-core** — fire agent for the first 8 Phase-1 tests.

Your job: create 8 GitHub issues and post `@kody ...` comments to trigger their pipelines. No batching, no sleeps between tests beyond the 3-second per-test delay.

**Context:** Running inside Kody-Engine-Tester repo.

**CRITICAL:** For every test: (1) create the issue, (2) **immediately post the `@kody` comment**. Both steps are required. Do every test below — do not stop partway.

---

## Run ID

```bash
RUN_ID="run-$(date -u +%Y%m%d)"
```

All temp issues use label `test-suite-temp` and title prefix `[${RUN_ID}]`.

---

## Fire the 8 core P1 tests

```bash
gh label create "test-suite-temp" --description "Temporary issues from test-suite runs" --color "FBCA04" 2>/dev/null || true

# --- P1T01 ---
issue=$(gh issue create --title "[${RUN_ID}] P1T01: Simple utility function" \
  --body "Verify @kody on a low-complexity task creates a 4-stage pipeline and PR.

Task: Add a \`formatDate(date: Date, locale: string): string\` utility function in src/utils/dateUtils.ts with JSDoc. Include unit tests.

Command: @kody" \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P1T01] issue #$issue"
gh issue comment "$issue" --body "@kody"
sleep 3

# --- P1T02 ---
issue=$(gh issue create --title "[${RUN_ID}] P1T02: Medium complexity with explicit full" \
  --body "Verify @kody full on a medium task runs 6+ stages.

Task: Add request-rate-limiting middleware in src/middleware/rateLimit.ts that tracks requests per IP using an in-memory Map. Include unit tests.

Command: @kody full" \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P1T02] issue #$issue"
gh issue comment "$issue" --body "@kody full"
sleep 3

# --- P1T03 (HIGH complexity — risk gate) ---
issue=$(gh issue create --title "[${RUN_ID}] P1T03: HIGH complexity triggers risk gate" \
  --body "Verify HIGH complexity task triggers the risk gate and pauses pipeline at plan stage.

Task: Replace the entire session-based authentication system with JWT-based authentication. Migrate the user schema to include jwt_secret, exp, and iat fields. Add RBAC with admin/editor/viewer roles. Update all API routes to use the new auth middleware. Run database migrations.

Command: @kody" \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
P1T03_ISSUE="$issue"
echo "[P1T03] issue #$issue"
gh issue comment "$issue" --body "@kody"
sleep 3

# --- P1T04 ---
issue=$(gh issue create --title "[${RUN_ID}] P1T04: Dry-run skips all stages" \
  --body "Verify --dry-run skips all stages without creating PRs.

Task: Add a CSV parser utility in src/utils/csvParser.ts with tests.

Command: @kody full --dry-run" \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P1T04] issue #$issue"
gh issue comment "$issue" --body "@kody full --dry-run"
sleep 3

# --- P1T19 ---
issue=$(gh issue create --title "[${RUN_ID}] P1T19: Fix-CI auto-trigger" \
  --body "Verify fix-ci workflow job triggers when CI fails on a PR.

## Verification
1. workflow_run event fires fix-ci-trigger job
2. @kody fix-ci comment auto-posted on PR
3. Pipeline runs mode=fix-ci, fetches CI logs, rebuilds from build stage
4. Fix pushed to same PR" \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P1T19] issue #$issue"
gh issue comment "$issue" --body "@kody"
sleep 3

# --- P1T20 ---
issue=$(gh issue create --title "[${RUN_ID}] P1T20: Status command no-op" \
  --body "Verify @kody status prints pipeline state without executing stages.

Command: @kody status" \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P1T20] issue #$issue"
gh issue comment "$issue" --body "@kody status"
sleep 3

# --- P1T21 ---
issue=$(gh issue create --title "[${RUN_ID}] P1T21: Taskify with priority labels" \
  --body "Verify @kody taskify creates sub-issues with priority labels, Test Strategy sections, and correct topo order.

Command: @kody taskify --file docs/test-prd.md" \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P1T21] issue #$issue"
gh issue comment "$issue" --body "@kody taskify --file docs/test-prd.md"
sleep 3

# --- P1T22 ---
issue=$(gh issue create --title "[${RUN_ID}] P1T22: Taskify context injection" \
  --body "Verify taskify receives project memory and file tree context.

Command: @kody taskify --file docs/test-prd.md" \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P1T22] issue #$issue"
gh issue comment "$issue" --body "@kody taskify --file docs/test-prd.md"
sleep 3

echo "=== 1a: 8 P1 core tests fired. ==="
```

---

## Auto-approve monitor for P1T03

P1T03 pauses at the risk gate. Launch a detached `nohup` monitor that polls every 20s for an approval question and auto-answers.

```bash
if [ -n "$P1T03_ISSUE" ] && [ "$P1T03_ISSUE" != "null" ]; then
  echo "[auto-approve] Launching nohup monitor for P1T03 (#$P1T03_ISSUE)..."
  nohup bash -c "
    for i in \$(seq 1 60); do
      sleep 20
      question=\$(gh api repos/aharonyaircohen/Kody-Engine-Tester/issues/$P1T03_ISSUE/comments \
        --jq '.[-2].body // \"\"' 2>/dev/null)
      if echo \"\$question\" | grep -qi 'questions before\|asking.*before\|approve'; then
        gh issue comment $P1T03_ISSUE --body '@kody approve

1. Keep UserStore as a fallback for non-Payload operations during migration
2. Check dependencies before removing — keep as fallback if anything still uses it
3. Align UserRole to RbacRole — make RbacRole the source of truth' 2>/dev/null
        exit 0
      fi
    done
  " > /tmp/auto-approve-T03.log 2>&1 &
fi
```
