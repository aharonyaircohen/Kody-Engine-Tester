# [run-20260410-1053] T37: Hotfix fast-track pipeline

## Task
Fix a broken export in src/utils/helpers.ts. The default export is missing from the main function.

Trigger: `@kody hotfix`

Expected: Only build→verify→ship execute (no taskify/plan/review/review-fix), tests skipped during verify, PR created with hotfix label.

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody hotfix

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `hotfix-1552-260410-105603` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24239564867))

To rerun: `@kody rerun hotfix-1552-260410-105603 --from <stage>`

