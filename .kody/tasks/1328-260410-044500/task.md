# [run-20260410-0437] T13: State bypass on rerun

## Task
Test that @kody rerun bypasses 'already completed' state lock.

## Task Description
Add a range utility function in src/utils/range.ts that generates an array of numbers from start to end.

## Test Steps
1. Create this temp issue
2. First run: Comment @kody (wait for completion)
3. Verify issue has kody:done label after completion
4. Second run: Comment @kody rerun
5. Verify: Pipeline re-executes (not blocked by 'already completed')

## Expected
- Rerun bypasses state lock
- Pipeline re-executes even on completed issue

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1328-260410-044500` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24226821595))

To rerun: `@kody rerun 1328-260410-044500 --from <stage>`

