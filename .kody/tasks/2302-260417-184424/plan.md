# Plan: P2T07b Build Stage

## Context
P2T07b (GitHub issue #2302) is a re-review pipeline test. P2T07 already identified a critical bug: the `playwright-cli attach` documentation uses `--cdp=` flag syntax that does not match the actual CLI interface (`attach [name]` positional argument).

This build stage must:
1. Check if the fix was applied since P2T07 reviewed it
2. Post a new review comment to the GitHub issue with updated findings

## What was already done
- P2T07 wrote `review.md` with FAIL verdict — `--cdp=` syntax bug in SKILL.md and session-management.md
- The crash log shows the actual CLI interface: `attach [name]` (positional, no `--cdp` flag)

## What we know from inspection
The documentation **still has the `--cdp=` bug** — no fix was applied. Both files need updating.

## Step 1 — Verify no fix was applied
- Read SKILL.md lines 191–199 (already done — bug confirmed present)
- Read session-management.md lines 111–146 (already done — bug confirmed present)
- Conclusion: **No fix was applied**

## Step 2 — Update review.md with P2T07b findings
Overwrite `review.md` with a new verdict. Since no fix was applied, the findings will largely overlap with P2T07, but the framing shifts to "re-review acknowledges fix not applied."

Key findings to report:
- SKILL.md lines 195–196: `playwright-cli attach --cdp=chrome` and `--cdp=msedge` → should be `playwright-cli attach chrome` and `playwright-cli attach msedge`
- SKILL.md line 199: `playwright-cli attach --cdp=http://localhost:9222` → should be `playwright-cli attach http://localhost:9222`
- session-management.md lines 118, 121, 124, 127, 137: same `--cdp=` prefix issues
- P2T07 findings were **acknowledged but not acted upon** — this is the key difference for P2T07b verification

## Step 3 — Post review comment to GitHub
Post the updated findings as a comment on GitHub issue #2302.

## Critical files
- `.agents/skills/playwright-cli/SKILL.md` — lines 195–199 (attach examples with `--cdp=`)
- `.agents/skills/playwright-cli/references/session-management.md` — lines 118, 121, 124, 127, 137 (attach examples with `--cdp=`)

## Verification
- `review.md` exists in task directory with updated P2T07b findings
- GitHub issue #2302 has a new comment posted
