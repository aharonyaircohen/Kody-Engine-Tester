# [run-20260407-2121] T37: Hotfix fast-track pipeline

## Task
The default export in src/utils/array-last.ts is missing. Add `export default` to the main function. This is an urgent production fix.

## Requirements
- Use @kody hotfix command
- Verify: only build → verify → ship stages execute (skip taskify/plan/review/review-fix)
- Verify: tests are skipped during verify (only typecheck+lint run)
- PR created with hotfix label

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-07):
@kody hotfix

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `hotfix-801-260407-212348` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24105093945))

To rerun: `@kody rerun hotfix-801-260407-212348 --from <stage>`

