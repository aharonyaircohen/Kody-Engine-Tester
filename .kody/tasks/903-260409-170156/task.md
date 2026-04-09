# [mem-20260409-1611] MF1: Add broken import utility

Create `src/utils/broken-import.ts` that imports from `@/nonexistent/module`. This will fail at verify (typecheck). After first failure, rerun with `@kody rerun` to trigger contradiction detection

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `903-260409-170156` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24202871877))

To rerun: `@kody rerun 903-260409-170156 --from <stage>`

