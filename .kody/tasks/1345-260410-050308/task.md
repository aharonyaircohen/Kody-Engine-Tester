# [run-20260410-0437] T35: Auto-learn memory committed in PR

## Task
Test that auto-learn runs before ship stage, committing memory files to the PR branch.

## Test Steps
1. Create this temp issue
2. Comment @kody
3. After PR created, check PR diff for memory files:
   gh pr diff <n> | grep "^diff --git.*\.kody/memory"
4. Verify: .kody/memory/ files appear in PR diff
5. Verify: Auto-learn runs BEFORE ship stage (check logs)

## Expected
- Memory files in PR diff
- Auto-learn runs before ship

---

## Discussion (5 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1345-260410-044949` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24226835702))

To rerun: `@kody rerun 1345-260410-044949 --from <stage>`

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `-Engine-Tester/actions/runs/24226835702))` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24227087447))

To rerun: `@kody rerun -Engine-Tester/actions/runs/24226835702)) --from <stage>`

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1345-260410-050308` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24227316396))

To rerun: `@kody rerun 1345-260410-050308 --from <stage>`

