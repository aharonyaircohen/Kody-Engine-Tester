# [run-20260409-2239] T37: Hotfix fast-track pipeline

## Task
Fix a broken export in src/utils/helpers.ts — the default export is missing from the main function.

## Note
This is an urgent production hotfix.

## Expected
- @kody hotfix command used
- Pipeline: build → verify (typecheck+lint only, NO tests) → ship
- taskify/plan/review/review-fix stages skipped
- PR created with hotfix label

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody hotfix

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `hotfix-1090-260409-224244` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24216895545))

To rerun: `@kody rerun hotfix-1090-260409-224244 --from <stage>`

