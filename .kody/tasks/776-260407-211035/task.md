# [mem-20260407-2007] Add broken import utility

Create `src/utils/broken-import.ts` that imports from `@/nonexistent/module`. This will fail at verify (typecheck). After first failure, rerun with `@kody rerun` to trigger contradiction detection

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `776-260407-211035` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24104569921))

To rerun: `@kody rerun 776-260407-211035 --from <stage>`

