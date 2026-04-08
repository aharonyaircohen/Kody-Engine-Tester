# test: verify playwright exec fires in verify stage

This issue is a live test for the tools.yml run field in the kody verify stage.

## What to verify
1. After kody runs the build stage, the verify stage should execute `npx playwright test`
2. The `verify.md` output should contain playwright test results
3. If playwright tests fail, the pipeline should fail

## Task
Make a small CSS tweak to the homepage header (e.g., change the header font-weight from 400 to 500). Run the full pipeline and confirm playwright tests execute in the verify stage.

## Expected outcome
- verify.md shows: `Running tool playwright: npx playwright test`
- Pipeline respects playwright test results

---

## Discussion (2 comments)

**@aguyaharonyair** (2026-04-08):
/kody

**@aharonyaircohen** (2026-04-08):
🚀 Kody pipeline started: `834-260408-171435` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24148633738))

To rerun: `@kody rerun 834-260408-171435 --from <stage>`

