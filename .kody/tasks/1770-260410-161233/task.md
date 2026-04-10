# [mem-20260410-1558] MF2: Add function with wrong return type

Create `src/utils/bad-types.ts` with `function getCount(): string { return 42 }`. Will fail typecheck. Rerun to trigger `!REPEAT_FAIL`

---

## Discussion (1 comments)

**@aharonyaircohen** (2026-04-10):
@kody

