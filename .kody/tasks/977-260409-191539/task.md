# [run-20260409-1749] T35: Auto-learn memory committed in PR

## Task
Test that auto-learn runs before ship stage, committing memory to PR.

## Task Description
Add an object diff utility in src/utils/objectDiff.ts.

## Verification
1. Check PR diff for .kody/memory/ files
2. Check run logs for auto-learn execution before ship stage
3. Auto-learn should run BEFORE ship — memory files appear in PR diff

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `977-260409-191539` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24208688271))

To rerun: `@kody rerun 977-260409-191539 --from <stage>`

