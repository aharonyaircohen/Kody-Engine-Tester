# [run-20260410-0437] T12: Rerun from specific stage

## Task
Test @kody rerun --from build which skips taskify and plan stages.

## Task Description
Add a chunk utility function in src/utils/chunk.ts that splits an array into chunks of specified size.

## Test Steps
1. Create this temp issue
2. First run: Comment @kody (wait for completion)
3. Second run: Comment @kody rerun --from build
4. Verify: 'Resuming from: build' in logs
5. Verify: taskify and plan NOT executed
6. Verify: build, verify, ship ARE executed

## Expected
- Rerun skips taskify+plan, runs from build

---

## Discussion (4 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1327-260410-044502` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24226821190))

To rerun: `@kody rerun 1327-260410-044502 --from <stage>`

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1327-260410-050505` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24227359341))

To rerun: `@kody rerun 1327-260410-050505 --from <stage>`

