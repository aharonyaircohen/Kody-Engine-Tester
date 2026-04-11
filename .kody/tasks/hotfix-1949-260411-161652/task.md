# [] T37: Hotfix: fast-track pipeline

The default export in src/utils/helpers.ts is missing. Add `export default` to the main function. This is an urgent production fix.

Run @kody hotfix on this issue. Expected: build → verify (typecheck+lint only, no tests) → ship, skipping taskify/plan/review/review-fix.

---

## Discussion (3 comments)

**@aharonyaircohen** (2026-04-11):
@kody hotfix

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `hotfix-1949-260411-161639` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286400802))

To rerun: `@kody rerun hotfix-1949-260411-161639 --from <stage>`

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `hotfix-1949-260411-161652` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24286400787))

To rerun: `@kody rerun hotfix-1949-260411-161652 --from <stage>`

