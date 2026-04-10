# [run-20260410-0437] T24: Decompose: simple task falls back

## Task
Test that @kody decompose falls back to normal pipeline when task complexity is low.

## Task Description
Add a string capitalize utility function in src/utils/capitalize.ts with tests.

## Test Steps
1. Create this simple temp issue
2. Comment @kody decompose
3. Verify: complexity_score < 6 OR not decomposable
4. Verify: Pipeline delegates to normal runPipeline() path
5. Verify: PR created via normal pipeline

## Expected
- Simple task not decomposed
- Falls back to normal pipeline
- PR created normally

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody decompose

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `decompose-1313-260410-044143` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24226735636))

To rerun: `@kody rerun decompose-1313-260410-044143 --from <stage>`

