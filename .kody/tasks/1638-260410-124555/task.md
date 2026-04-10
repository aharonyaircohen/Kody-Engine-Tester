# [mem-20260410-1245] MF1: Add broken import utility

Create `src/utils/broken-import.ts` that imports from `@/nonexistent/module`. This will fail at verify (typecheck). After first failure, rerun with `@kody rerun` to trigger contradiction detection

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1638-260410-124555` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24243587468))

To rerun: `@kody rerun 1638-260410-124555 --from <stage>`

