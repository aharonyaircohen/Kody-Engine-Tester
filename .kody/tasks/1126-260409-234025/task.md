# [mem-20260409-2331] MF1: Add broken import utility

Create `src/utils/broken-import.ts` that imports from `@/nonexistent/module`. This will fail at verify (typecheck). After first failure, rerun with `@kody rerun` to trigger contradiction detection

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `1126-260409-234025` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24218756775))

To rerun: `@kody rerun 1126-260409-234025 --from <stage>`

