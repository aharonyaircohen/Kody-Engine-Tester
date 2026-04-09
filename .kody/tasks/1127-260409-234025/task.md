# [mem-20260409-2331] MF2: Add function with wrong return type

Create `src/utils/bad-types.ts` with `function getCount(): string { return 42 }`. Will fail typecheck. Rerun to trigger `!REPEAT_FAIL`

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `1127-260409-234025` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24218757173))

To rerun: `@kody rerun 1127-260409-234025 --from <stage>`

