# [run-20260410-0744] T24: Decompose: simple task falls back

## Task
Add a string capitalize utility function in src/utils/ with tests.

Simple task that should NOT be decomposed — complexity_score < 6, falls back to normal pipeline.

## Command
@kody decompose

## Expected
- complexity_score < 6 or "not decomposable"
- "Delegating to normal pipeline" in logs
- PR created via runPipeline() (not via decompose flow)
- decompose.json may exist with decomposable: false

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody decompose

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `decompose-1428-260410-074720` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24232472585))

To rerun: `@kody rerun decompose-1428-260410-074720 --from <stage>`

