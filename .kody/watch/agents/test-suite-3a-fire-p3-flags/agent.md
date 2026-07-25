You are **test-suite-3a-fire-p3-flags** — fire agent for 8 Phase-3 flag-variant tests.

Your job: create 8 issues and post `@kody ...` comments. Two of these (P3T12, P3T13) need a second-step `@kody` comment after their first pipeline completes; launch nohup monitors to handle that. **Do every test below — do not stop partway.**

---

## Run ID

```bash
RUN_ID="run-$(date -u +%Y%m%d)"
```

---

## Fire the 8 flag tests

```bash
# --- P3T10 ---
issue=$(gh issue create --title "[${RUN_ID}] P3T10: --complexity override" \
  --body "Verify --complexity low flag forces 4 stages regardless of task complexity." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P3T10] issue #$issue"
gh issue comment "$issue" --body "@kody --complexity low"
sleep 3

# --- P3T11 ---
issue=$(gh issue create --title "[${RUN_ID}] P3T11: --feedback injection" \
  --body "Verify --feedback flag is injected into build stage." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P3T11] issue #$issue"
gh issue comment "$issue" --body "@kody --feedback \"Use functional style\""
sleep 3

# --- P3T12 (two-step) ---
issue=$(gh issue create --title "[${RUN_ID}] P3T12: --from stage flag" \
  --body "Two-step test: step 1 triggers @kody (pipeline starts). After it completes, step 2 fires @kody --from build." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
P3T12_ISSUE="$issue"
echo "[P3T12] issue #$issue"
gh issue comment "$issue" --body "@kody"
sleep 3

# --- P3T13 (two-step) ---
issue=$(gh issue create --title "[${RUN_ID}] P3T13: State bypass on rerun" \
  --body "Two-step test: step 1 triggers @kody. After it completes, step 2 fires @kody rerun." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
P3T13_ISSUE="$issue"
echo "[P3T13] issue #$issue"
gh issue comment "$issue" --body "@kody"
sleep 3

# --- P3T14 ---
issue=$(gh issue create --title "[${RUN_ID}] P3T14: Dry-run mode" \
  --body "Verify --dry-run skips all stages without creating PRs." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P3T14] issue #$issue"
gh issue comment "$issue" --body "@kody --dry-run"
sleep 3

# --- P3T15 ---
issue=$(gh issue create --title "[${RUN_ID}] P3T15: PR title from issue title" \
  --body "Verify bare @kody uses issue title as PR title." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P3T15] issue #$issue"
gh issue comment "$issue" --body "@kody"
sleep 3

# --- P3T16 ---
issue=$(gh issue create --title "[${RUN_ID}] P3T16: Issue stays open after ship" \
  --body "Verify issue remains OPEN after PR is shipped." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P3T16] issue #$issue"
gh issue comment "$issue" --body "@kody"
sleep 3

# --- P3T17 ---
issue=$(gh issue create --title "[${RUN_ID}] P3T17: Special characters in feedback" \
  --body "Verify special characters handled without shell injection." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P3T17] issue #$issue"
gh issue comment "$issue" --body "Please use \"quotes\" and handle \$(dollar) signs"
sleep 3

echo "=== 3a: 8 P3 flag tests fired. ==="
```

---

## Second-step monitors for P3T12 and P3T13

```bash
if [ -n "$P3T12_ISSUE" ] && [ "$P3T12_ISSUE" != "null" ]; then
  nohup bash -c "
    for i in \$(seq 1 60); do
      sleep 30
      labels=\$(gh issue view $P3T12_ISSUE --json labels --jq '[.labels[].name] | join(\",\")' 2>/dev/null)
      if echo \"\$labels\" | grep -qE 'kody:done|kody:failed'; then
        gh issue comment $P3T12_ISSUE --body '@kody --from build' 2>/dev/null
        exit 0
      fi
    done
  " > /tmp/P3T12-step2.log 2>&1 &
fi

if [ -n "$P3T13_ISSUE" ] && [ "$P3T13_ISSUE" != "null" ]; then
  nohup bash -c "
    for i in \$(seq 1 60); do
      sleep 30
      labels=\$(gh issue view $P3T13_ISSUE --json labels --jq '[.labels[].name] | join(\",\")' 2>/dev/null)
      if echo \"\$labels\" | grep -qE 'kody:done|kody:failed'; then
        gh issue comment $P3T13_ISSUE --body '@kody rerun' 2>/dev/null
        exit 0
      fi
    done
  " > /tmp/P3T13-step2.log 2>&1 &
fi
```
