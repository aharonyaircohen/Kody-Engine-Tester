# [run-20260410-1148] T37: Hotfix: fix broken export in utils

## Task
The default export in src/utils/helpers.ts is missing. Add `export default` to the main function. This is an urgent production fix.

## Context
Production is down because the helpers module can't be imported.


---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody hotfix

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `hotfix-1592-260410-120757` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24242125618))

To rerun: `@kody rerun hotfix-1592-260410-120757 --from <stage>`

