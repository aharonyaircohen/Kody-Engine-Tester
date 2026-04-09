# [mem-20260409-1429] MF2: Add function with wrong return type

Create `src/utils/bad-types.ts` with `function getCount(): string { return 42 }`. Will fail typecheck. Rerun to trigger `!REPEAT_FAIL`

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `880-260409-150921` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24197666892))

To rerun: `@kody rerun 880-260409-150921 --from <stage>`

