# [run-20260410-1053] T24: Decompose simple task fallback

## Task
Test that simple tasks fall back to normal pipeline instead of attempting decompose.

Add a `debounce` utility function in `src/utils/debounce-advanced.ts` with tests in `debounce-advanced.test.ts`. This is a simple single-file task that should NOT be decomposable.

Trigger: `@kody decompose`

Expected: complexity_score < 4, falls back to normal pipeline, PR created via runPipeline().

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody decompose

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `decompose-1548-260410-105625` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24239563036))

To rerun: `@kody rerun decompose-1548-260410-105625 --from <stage>`

