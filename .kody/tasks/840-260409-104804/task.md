# feat: Add memory nudge feature for auto-extracting patterns

## Description
Enable Kody to auto-extract reusable patterns from completed tasks using an LLM-driven nudge. After a successful ship, the engine should ask itself "should I save any pattern from this task?" and write useful facts to graph memory.

## Acceptance Criteria
- [ ] After a successful task completion, Kody calls the nudge engine (when `KODY_MEMORY_NUDGE=true`)
- [ ] The nudge engine analyzes task artifacts (task.md, plan.md, review.md, verify.md)
- [ ] Identified patterns are written to graph memory as facts/conventions/preferences
- [ ] New graph episodes are created with source "nudge"
- [ ] Check `.kody/graph/episodes/ep_nudge_*.json` for new entries
- [ ] Check `.kody/graph/nodes.json` for new memory nodes

## Test Verification
After running the pipeline, verify:
```bash
kody graph status .
kody graph query . <pattern-search-term>
```