# [mem-20260410-1558] MF1: Add broken import utility

Create `src/utils/broken-import.ts` that imports from `@/nonexistent/module`. This will fail at verify (typecheck). After first failure, rerun with `@kody rerun` to trigger contradiction detection

---

## Discussion (1 comments)

**@aharonyaircohen** (2026-04-10):
@kody

