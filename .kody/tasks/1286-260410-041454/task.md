# [mem-20260410-0349] MF2: Add function with wrong return type

Create `src/utils/bad-types.ts` with `function getCount(): string { return 42 }`. Will fail typecheck. Rerun to trigger `!REPEAT_FAIL`

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1286-260410-041454` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24226044576))

To rerun: `@kody rerun 1286-260410-041454 --from <stage>`

