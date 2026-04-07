# [run-20260407-1802] T36: Engine-managed dev server

## Task
Test engine manages dev server lifecycle for UI tasks.

## Setup
Check kody.config.json has devServer configured.

## Command
@kody on a UI-focused issue (e.g., "Add a search bar component")

## Expected
- Engine starts dev server: "Starting dev server:"
- KODY_DEV_SERVER_READY env var set
- Engine stops dev server: "Dev server stopped"
- Agent does NOT start its own dev server

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `590-260407-182514` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24097544769))

To rerun: `@kody rerun 590-260407-182514 --from <stage>`

