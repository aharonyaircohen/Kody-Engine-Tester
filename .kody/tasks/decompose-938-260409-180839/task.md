# [run-20260409-1749] T24: Decompose: simple task fallback

## Task
Test that @kody decompose on a simple task falls back to normal pipeline.

## Task Description
Add a string capitalize utility function in src/utils/string-capitalizer.ts that capitalizes the first letter of each word. Include tests in src/utils/string-capitalizer.test.ts.

## Verification
- Check logs for complexity_score < 6 OR "not decomposable"
- Pipeline delegates to normal runPipeline() path
- PR created via normal pipeline (not decomposed)
- decompose.json artifact has decommposable: false

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody decompose

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `decompose-938-260409-180839` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24205758008))

To rerun: `@kody rerun decompose-938-260409-180839 --from <stage>`

