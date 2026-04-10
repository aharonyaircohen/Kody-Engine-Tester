# [run-20260410-0437] T15: PR title from issue title

## Task
Test that @kody uses the issue title (with type prefix) as the PR title instead of LLM-generated verbose title.

## Task Description
Add a unique utility in src/utils/unique.ts that returns unique elements from an array preserving order.

## Test Steps
1. Create this temp issue
2. Comment @kody
3. After PR created, verify PR title is '<type>: <issue title>'
4. Verify PR title does NOT look like verbose LLM-generated summary

## Expected
- PR title uses issue title with type prefix
- Not a verbose LLM-generated summary

---

## Discussion (5 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1330-260410-044530` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24226815529))

To rerun: `@kody rerun 1330-260410-044530 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24226815529))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24226966222))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24226815529)) --from <stage>`

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24226966222))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24227139482))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24226966222)) --from <stage>`

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24227139482))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24227200067))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24227139482)) --from <stage>`

