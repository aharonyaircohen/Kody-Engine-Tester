# [mem-20260410-0852] MF1: Add broken import utility

Create `src/utils/broken-import.ts` that imports from `@/nonexistent/module`. This will fail at verify (typecheck). After first failure, rerun with `@kody rerun` to trigger contradiction detection

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1472-260410-085346` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24234922357))

To rerun: `@kody rerun 1472-260410-085346 --from <stage>`

