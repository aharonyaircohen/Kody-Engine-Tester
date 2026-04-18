You are **test-suite-3b-fire-p3-features** — fire agent for 9 Phase-3 complex-feature tests.

Your job: create 9 issues and post `@kody ...` comments. **Do every test below — do not stop partway.**

---

## Run ID

```bash
RUN_ID="run-$(date -u +%Y%m%d)"
```

---

## Fire the 9 P3 feature tests

```bash
# --- P3T18 ---
issue=$(gh issue create --title "[${RUN_ID}] P3T18: UI task gets Playwright MCP" \
  --body "Verify UI tasks get Playwright MCP auto-injected.

Task: Add a dashboard page with charts and data tables." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P3T18] issue #$issue"
gh issue comment "$issue" --body "@kody

Task: Add a new dashboard page with charts and data tables."
sleep 3

# --- P3T19 ---
issue=$(gh issue create --title "[${RUN_ID}] P3T19: Force-with-lease retry on rerun push" \
  --body "Verify force-with-lease retry when push is rejected during rerun." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P3T19] issue #$issue"
gh issue comment "$issue" --body "@kody"
sleep 3

# --- P3T23 ---
issue=$(gh issue create --title "[${RUN_ID}] P3T23: Issue attachments and metadata enrichment" \
  --body "Verify image attachments are downloaded and labels/comments enrich task.md." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P3T23] issue #$issue"
gh issue comment "$issue" --body "@kody

Task: Add a footer component.

## Design
![mockup](https://github.com/user-attachments/assets/test-uuid/footer-design.png)"
sleep 3

# --- P3T27 ---
issue=$(gh issue create --title "[${RUN_ID}] P3T27: Decompose with config disabled" \
  --body "Verify decompose.enabled=false causes immediate fallback to normal pipeline." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P3T27] issue #$issue"
gh issue comment "$issue" --body "@kody decompose

Task: Add pagination to the course list page."
sleep 3

# --- P3T30 ---
issue=$(gh issue create --title "[${RUN_ID}] P3T30: Decompose sub-task failure triggers fallback" \
  --body "Verify sub-task failure in decompose triggers worktree cleanup and fallback." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P3T30] issue #$issue"
gh issue comment "$issue" --body "@kody decompose

Task: Implement a caching system: Redis adapter in src/cache/redisAdapter.ts (requires ioredis NOT installed), in-memory adapter, cache manager."
sleep 3

# --- P3T33b ---
issue=$(gh issue create --title "[${RUN_ID}] P3T33b: Lifecycle label progression" \
  --body "Verify lifecycle labels progress through planning->building->verifying->review->done." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P3T33b] issue #$issue"
gh issue comment "$issue" --body "@kody"
sleep 3

# --- P3T34 ---
issue=$(gh issue create --title "[${RUN_ID}] P3T34: Token ROI in retrospective" \
  --body "Verify retrospective.md includes token usage and ROI metrics." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P3T34] issue #$issue"
gh issue comment "$issue" --body "@kody"
sleep 3

# --- P3T35 ---
issue=$(gh issue create --title "[${RUN_ID}] P3T35: Auto-learn memory in PR" \
  --body "Verify auto-learned memory is attached to PR." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P3T35] issue #$issue"
gh issue comment "$issue" --body "@kody"
sleep 3

# --- P3T36 ---
issue=$(gh issue create --title "[${RUN_ID}] P3T36: Engine-managed dev server" \
  --body "Verify engine starts/stops dev server for UI tasks.

Task: Add a new dashboard page with charts and data tables." \
  --label "test-suite-temp" | grep -oE '[0-9]+$')
echo "[P3T36] issue #$issue"
gh issue comment "$issue" --body "@kody

Task: Add a new dashboard page with charts and data tables."
sleep 3

echo "=== 3b: 9 P3 feature tests fired. ==="
```
