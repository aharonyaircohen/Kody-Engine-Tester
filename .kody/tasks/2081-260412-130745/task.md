# [run-20260412-1306] T12: Rerun from specific stage

Verify @kody rerun --from build skips taskify+plan and runs from build.

Trigger with: @kody rerun --from build

## Verification
Logs should show 'Resuming from: build' and skip taskify/plan stages.

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-12):
@kody

**@aharonyaircohen** (2026-04-12):
🚀 Kody pipeline started: `2081-260412-130745` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24307463967))

