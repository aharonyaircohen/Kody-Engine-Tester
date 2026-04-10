# [run-20260410-0437] T16: Issue stays open after PR

## Task
Test that the issue remains OPEN after PR is created (ship stage), and only auto-closes when PR is merged.

## Task Description
Add a pick utility in src/utils/pick.ts that picks specified keys from an object.

## Test Steps
1. Create this temp issue
2. Comment @kody
3. After PR created, verify issue state is OPEN (not closed)
4. Verify PR body contains 'Closes #<issue_number>'
5. After merging PR in cleanup, verify issue auto-closes

## Expected
- Issue remains OPEN after PR creation
- Closes #N in PR body triggers auto-close on merge

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1331-260410-044432` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24226815563))

To rerun: `@kody rerun 1331-260410-044432 --from <stage>`

