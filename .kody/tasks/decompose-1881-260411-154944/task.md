# [] T24: Decompose: simple task falls back

## Task
Test that a simple task (complexity_score < 4) falls back to normal pipeline:
- Task: Add a string capitalize utility function in src/utils/strings.ts with tests

## Verification
- complexity_score < 4 detected
- Falls back to normal pipeline (runPipeline)
- PR created normally via standard flow
- decompose.json may exist with decomposable: false

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-11):
@kody decompose

**@aharonyaircohen** (2026-04-11):
🚀 Kody pipeline started: `decompose-1881-260411-154944` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24285978240))

To rerun: `@kody rerun decompose-1881-260411-154944 --from <stage>`

