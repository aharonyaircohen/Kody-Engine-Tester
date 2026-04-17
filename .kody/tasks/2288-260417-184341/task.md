# [run-20260417-1832] P1T21: Taskify with priority labels

Verify @kody taskify creates sub-issues with priority labels, Test Strategy sections, and correct topo order.

Command: @kody taskify --file docs/test-prd.md

Setup: Create docs/test-prd.md with a spec spanning 3 dependent tasks.

## Verification
1. Sub-issues created with priority:high/medium/low labels
2. Each sub-issue body has ## Test Strategy section
3. Each sub-issue body has ## Context section
4. Each sub-issue body has ## Acceptance Criteria section
5. Topological order correct (depends-on filed before dependent)

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-17):
@kody

**@aharonyaircohen** (2026-04-17):
🚀 Kody pipeline started: `2288-260417-184341`

