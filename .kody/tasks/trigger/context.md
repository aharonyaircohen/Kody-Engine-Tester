
### taskify (2026-04-18T07:04:07)
I've written the classification plan to `/home/runner/.claude/plans/rustling-prancing-wave.md` and submitted it for your approval.

**Summary of the classification:**

The `trigger` task (Test Suite Digest run-20260418-0344) is classified as a **feature** task titled *"Fix kody engine budget and pipeline execution failures"* (risk: **medium**).

Two root causes drive 28 of the 45 test failures:
1. **11 FAIL** — `max_budget` ($1–$1.5) is too low for taskify/plan stages → needs engine config incre
...(truncated)

### build (2026-04-18T07:11:12)
The plan is complete and ready for your review. Here's a summary of the two fixes:

**Fix 1 — Budget Exhaustion (11 FAILs):** Add `agent.budgets` overrides to `kody.config.json` doubling taskify/plan limits from $1.5/$1 to $3.0/$2, using `maxBudgetUsd` per stage. The engine already supports this via `applyBudgetOverrides(config.agent.budgets)`.

**Fix 2 — Pipeline Skips (17 TIMEOUTs):** Remove the `github.event.comment.user.type != 'Bot'` filter from `kody.yml` line 81. The test suite posts `@ko
...(truncated)
