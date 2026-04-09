# [run-20260409-1749] T37: Hotfix: fast-track pipeline

## Task
Test @kody hotfix command (build → verify [typecheck+lint only] → ship, skipping taskify/plan/review).

## Task Description
Fix the broken export in src/utils/string-capitalizer.ts — the default export is missing from the main function.

## Steps
1. First create the file with the broken export (no default):
   ```bash
   echo 'export function capitalizeWords(s: string): string { return s; }' > src/utils/string-capitalizer.ts
   git add src/utils/string-capitalizer.ts && git commit -m "test: add broken export for T37"
   ```
2. Comment @kody hotfix on this issue

## Verification
- Mode is hotfix, task-id matches hotfix-<issue>-<timestamp>
- Only build, verify, ship stages execute (not taskify/plan/review/review-fix)
- verify skips tests (only typecheck and lint run)
- PR created with hotfix label

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody hotfix

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `hotfix-944-260409-180847` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24205762669))

To rerun: `@kody rerun hotfix-944-260409-180847 --from <stage>`

