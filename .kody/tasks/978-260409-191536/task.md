# [run-20260409-1749] T36: Engine-managed dev server

## Task
Test that engine starts/stops dev server for UI tasks, not the agent.

## Task Description
Add a search bar component in src/components/SearchBar.tsx.

## Verification
- Logs show "Starting dev server: pnpm dev"
- KODY_DEV_SERVER_READY env var set
- Logs show "Dev server stopped" after stage
- Agent does NOT start its own dev server

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `978-260409-191536` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24208689385))

To rerun: `@kody rerun 978-260409-191536 --from <stage>`

