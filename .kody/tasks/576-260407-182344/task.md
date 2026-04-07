# [run-20260407-1802] T11: Flag feedback injection

## Task
Test --feedback flag injection into build stage.

## Command
@kody --feedback "Use functional style for all utilities"

## Expected
- Feedback appears in build stage logs as "feedback: Use functional style..."
- FEEDBACK env var set in orchestrate job

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-07):
@kody --feedback "Use functional style for all utilities"

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `576-260407-182344` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24097504956))

To rerun: `@kody rerun 576-260407-182344 --from <stage>`

