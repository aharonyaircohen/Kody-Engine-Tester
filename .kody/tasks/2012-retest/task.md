# [run-20260411-2048] T37: Hotfix fast-track pipeline

## Task
Run @kody hotfix on an urgent issue to verify the compressed pipeline runs.

## Task Description
Fix the missing default export in `src/utils/helpers.ts`. The main function needs `export default`.

## Acceptance Criteria
- [ ] Mode is hotfix, skips taskify/plan/review/review-fix
- [ ] Only build → verify → ship stages run
- [ ] verify skips tests (only typecheck + lint)
- [ ] PR created with hotfix label

---

## Discussion (40 comments)

*Showing first 5 and last 10 of 40 comments*

**@aharonyaircohen** (2026-04-11):
@kody hotfix

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `hotfix-2012-260411-175043` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24288127402))

To rerun: `@kody rerun hotfix-2012-260411-175043 --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24288127402))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24288170241))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24288127402)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24288170241))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24288215774))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24288170241)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24288215774))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24288249532))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24288215774)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
@kody

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `2012-260411-195053` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24290262958))

**@aharonyaircohen** (2026-04-11):
❌ Pipeline crashed: ENOENT: no such file or directory, open '/home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester/.kody/tasks/2012-260411-195053/.lock'

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/Kody-Engine-Tester/.kody/tasks/2012-260411-195053/.lock'` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24290299873))

**@aharonyaircohen** (2026-04-11):
@kody

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `2012-260411-195917` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24290407165))

To rerun: `@kody rerun 2012-260411-195917 --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24290407165))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24290431500))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24290407165)) --from <stage>`

**@aharonyaircohen** (2026-04-11):
@kody

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `2012-260411-201146` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24290638565))

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `2012-retest` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24291310152))

