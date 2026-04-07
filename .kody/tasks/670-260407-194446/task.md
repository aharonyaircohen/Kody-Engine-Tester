# [mem-20260407-2209] MF1: Add broken import utility

Create `src/utils/broken-import.ts` that imports from `@/nonexistent/module`. This will fail at verify (typecheck). After first failure, rerun with `@kody rerun` to trigger contradiction detection

---

## Discussion (2 comments)

**@aguyaharonyair** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `670-260407-194446` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24100996808))

To rerun: `@kody rerun 670-260407-194446 --from <stage>`

