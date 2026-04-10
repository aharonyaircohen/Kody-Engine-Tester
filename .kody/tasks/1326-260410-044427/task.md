# [run-20260410-0437] T11: Flag: feedback injection

## Task
Test @kody --feedback which injects feedback into the build stage.

## Task Description
Add a retry utility function in src/utils/retry.ts with configurable retry logic. Include tests.

## Test Steps
1. Create this temp issue
2. Comment @kody --feedback "Use functional style with pure functions"
3. Verify: feedback appears in build stage logs
4. Verify: FEEDBACK= env var set in orchestrate job

## Expected
- Feedback text appears in build stage logs
- FEEDBACK env var propagated

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody --feedback "Use functional style with pure functions"

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1326-260410-044427` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24226814051))

To rerun: `@kody rerun 1326-260410-044427 --from <stage>`

