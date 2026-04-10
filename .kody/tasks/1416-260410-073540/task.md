# [mem-20260410-0601] MF2: Add function with wrong return type

Create `src/utils/bad-types.ts` with `function getCount(): string { return 42 }`. Will fail typecheck. Rerun to trigger `!REPEAT_FAIL`

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1416-260410-073540` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24232056452))

To rerun: `@kody rerun 1416-260410-073540 --from <stage>`

