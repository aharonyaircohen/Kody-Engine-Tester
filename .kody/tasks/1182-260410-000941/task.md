# [run-20260409-2355] T10: Flag complexity override

## Task
Test that `@kody --complexity low` forces LOW complexity.

## Context
Create a simple string formatting utility in src/utils/format-phone.ts that formats phone numbers.

## Verification
After `@kody --complexity low`:
1. Check logs show "Complexity override: low" (not "auto-detected")
2. Verify env var COMPLEXITY=low propagated to orchestrate job
3. Only 4 stages execute: taskify → build → verify → ship (no plan/review)

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody --complexity low

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1182-260410-000941` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24219607560))

To rerun: `@kody rerun 1182-260410-000941 --from <stage>`

