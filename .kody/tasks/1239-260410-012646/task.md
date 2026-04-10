# [mem-20260410-0022] MF1: Add broken import utility

Create `src/utils/broken-import.ts` that imports from `@/nonexistent/module`. This will fail at verify (typecheck). After first failure, rerun with `@kody rerun` to trigger contradiction detection

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1239-260410-012646` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24221710633))

To rerun: `@kody rerun 1239-260410-012646 --from <stage>`

