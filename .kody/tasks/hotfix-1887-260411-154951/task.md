# [] T37: Hotfix: fix broken export in utils

## Task
Test @kody hotfix — the fast-track pipeline:
- Task: Add missing export default to src/utils/helpers.ts

This is an urgent production fix that should skip taskify/plan/review/review-fix.

## Verification
- Mode is hotfix, task-id matches hotfix-<issue>-<timestamp>
- Only build → verify → ship stages execute
- taskify, plan, review, review-fix are SKIPPED
- verify runs typecheck+lint only, NO tests
- PR created with hotfix label

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-11):
@kody hotfix

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `hotfix-1887-260411-154951` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285980382))

To rerun: `@kody rerun hotfix-1887-260411-154951 --from <stage>`

