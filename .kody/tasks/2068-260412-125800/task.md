# [run-20260412-1223] T12: Rerun from specific stage

Verify @kody rerun --from build skips taskify and plan, runs from build stage.

Trigger with: @kody --from build

## Verification
Logs should show 'Resuming from: build' and skip taskify/plan stages.

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-12):
@kody --from build

**@aharonyaircohen** (2026-04-12):
🚀 Kody pipeline started: `2068-260412-125800` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24307286194))

