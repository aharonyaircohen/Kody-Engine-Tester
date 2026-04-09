# [run-20260409-2001] T37: Hotfix fast-track pipeline

## Task
Fix broken export in src/utils/helpers.ts - the default export is missing.

## Command
@kody hotfix

## Verification Required
1. Mode is hotfix, skips taskify/plan/review/review-fix
2. Only build → verify → ship stages execute
3. Verify stage skips tests (only typecheck + lint)
4. PR created with hotfix label

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody hotfix

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `hotfix-1003-260409-202754` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24211719730))

To rerun: `@kody rerun hotfix-1003-260409-202754 --from <stage>`

