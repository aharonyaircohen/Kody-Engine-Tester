# [run-20260409-1749] T13: State bypass on rerun

## Task
Test that @kody rerun on a completed issue bypasses state locks.

## Precondition
Use issue #928 (T01 completed issue with kody:done label).

## Steps
1. Verify issue #928 has kody:done label
2. Comment @kody rerun 928-260409-174952 on this issue

## Verification
- Pipeline re-executes (not blocked by "already completed" message)
- Issue #928 remains usable for rerun

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody rerun 928-260409-174952

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `928-260409-174952` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24208680485))

To rerun: `@kody rerun 928-260409-174952 --from <stage>`

