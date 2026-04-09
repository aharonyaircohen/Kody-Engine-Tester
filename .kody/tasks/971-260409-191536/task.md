# [run-20260409-1749] T16: Issue stays open after PR

## Task
Test that issue remains OPEN after PR is created (not prematurely closed).

## Task Description
Add a color conversion utility in src/utils/colorConverter.ts that converts between HEX, RGB, and HSL.

## Steps
1. Comment @kody on this issue
2. After PR created, check issue state

## Verification
- Issue state is OPEN (not closed)
- PR body contains "Closes #<issue_number>"
- Issue closes only after PR merge (verify in Phase 4)

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `971-260409-191536` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24208685533))

To rerun: `@kody rerun 971-260409-191536 --from <stage>`

