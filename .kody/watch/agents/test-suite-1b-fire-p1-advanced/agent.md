You are **test-suite-1b-fire-p1-advanced** — fire agent for the remaining 9 Phase-1 tests.

Your job: create 9 GitHub issues and post `@kody ...` comments. No batching, no sleeps beyond 3 sec per test. **Do every test below — do not stop partway.**

---

## Run ID

```bash
RUN_ID="run-$(date -u +%Y%m%d)"
```

---

## Fire the 9 advanced P1 tests

```bash
# --- P1T24 ---
issue=$(gh issue create --title "[${RUN_ID}] P1T24: Decompose fallback for simple task" \
  --body "Verify @kody decompose falls back to normal pipeline for simple tasks.

Task: Add a string capitalize utility in src/utils/strings.ts with tests.

Command: @kody decompose" \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P1T24] issue #$issue"
gh issue comment "$issue" --body "@kody decompose

Task: Add a string capitalize utility in src/utils/strings.ts with tests."
sleep 3

# --- P1T25 ---
issue=$(gh issue create --title "[${RUN_ID}] P1T25: Decompose complex multi-area task" \
  --body "Verify @kody decompose splits complex tasks into parallel sub-tasks.

Task: Add a complete notification system: model in src/models/notification.ts, service in src/services/notificationService.ts, API routes in src/routes/notifications.ts, helpers in src/utils/notificationHelpers.ts, plus tests.

Command: @kody decompose" \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P1T25] issue #$issue"
gh issue comment "$issue" --body "@kody decompose

Task: Add a complete notification system with model, service, routes, helpers, and tests across multiple directories."
sleep 3

# --- P1T26 ---
issue=$(gh issue create --title "[${RUN_ID}] P1T26: Decompose --no-compose flag" \
  --body "Verify @kody decompose --no-compose stops after parallel builds.

Task: Add a config validator module in src/utils/configValidator.ts with tests.

Command: @kody decompose --no-compose" \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P1T26] issue #$issue"
gh issue comment "$issue" --body "@kody decompose --no-compose

Task: Add a config validator module in src/utils/configValidator.ts with tests."
sleep 3

# --- P1T31 ---
issue=$(gh issue create --title "[${RUN_ID}] P1T31: Bootstrap extend mode" \
  --body "Verify @kody bootstrap generates/extends memory, step files, tools.yml.

Command: @kody bootstrap" \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P1T31] issue #$issue"
gh issue comment "$issue" --body "@kody bootstrap"
sleep 3

# --- P1T32 ---
issue=$(gh issue create --title "[${RUN_ID}] P1T32: Watch health monitoring" \
  --body "Verify watch --dry-run runs health plugins without posting to GitHub.

Command: @kody watch --dry-run" \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P1T32] issue #$issue"
gh issue comment "$issue" --body "@kody watch --dry-run"
sleep 3

# --- P1T33 ---
issue=$(gh issue create --title "[${RUN_ID}] P1T33: Bootstrap model override" \
  --body "Verify bootstrap respects --model and --provider flags.

Command: @kody bootstrap --provider=minimax --model=MiniMax-M1 --force" \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P1T33] issue #$issue"
gh issue comment "$issue" --body "@kody bootstrap --force

Task: Add retry logic to the API client."
sleep 3

# --- P1T37 ---
issue=$(gh issue create --title "[${RUN_ID}] P1T37: Hotfix fast-track pipeline" \
  --body "Verify @kody hotfix runs build→verify(skip tests)→ship, skipping taskify/plan/review.

Task: Fix the missing default export in src/utils/helpers.ts.

Command: @kody hotfix" \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P1T37] issue #$issue"
gh issue comment "$issue" --body "@kody hotfix

Task: Fix the missing default export in src/utils/helpers.ts."
sleep 3

# --- P1T40 ---
issue=$(gh issue create --title "[${RUN_ID}] P1T40: Release dry-run" \
  --body "Verify @kody release --dry-run analyzes commits and previews release without side effects.

Command: @kody release --dry-run" \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P1T40] issue #$issue"
gh issue comment "$issue" --body "@kody release --dry-run"
sleep 3

# --- P1T41 ---
issue=$(gh issue create --title "[${RUN_ID}] P1T41: Release creates PR" \
  --body "Verify @kody release bumps version, generates changelog, creates release PR.

Command: @kody release" \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P1T41] issue #$issue"
gh issue comment "$issue" --body "@kody release"
sleep 3

echo "=== 1b: 9 P1 advanced tests fired. ==="
```
