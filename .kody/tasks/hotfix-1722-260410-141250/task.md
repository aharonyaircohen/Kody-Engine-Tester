# [run-20260410-1407] T37: Hotfix: fast-track pipeline

## Task
Run @kody hotfix on an urgent production fix.

## Task Description
The default export in src/utils/helpers.ts is missing. Add `export default` to the main function. This is an urgent production fix.

## Verification
- Mode is hotfix, skips taskify/plan/review/review-fix
- Only build → verify → ship stages execute
- Verify skips tests (only typecheck + lint)
- PR created with hotfix label

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody hotfix

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `hotfix-1722-260410-141250` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24247200336))

To rerun: `@kody rerun hotfix-1722-260410-141250 --from <stage>`

