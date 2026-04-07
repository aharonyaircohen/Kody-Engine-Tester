# [run-20260407-2330] T37: Hotfix fast-track

## Task
Fix broken export in src/utils/helpers.ts - the default export is missing from the main function. Add `export default` to the main function. This is an urgent production fix.

## Complexity
low

## Acceptance Criteria
- Pipeline runs with hotfix mode (build → verify → ship, no taskify/plan/review)
- Tests skipped during verify
- PR created

---

## Discussion (2 comments)

**@aguyaharonyair** (2026-04-07):
@kody hotfix

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `hotfix-758-260407-210007` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24104141191))

To rerun: `@kody rerun hotfix-758-260407-210007 --from <stage>`

