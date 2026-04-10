# [run-20260410-0144] T10: Flag complexity override test

## Task
Add a `deep-merge` utility function in `src/utils/deep-merge.ts` that recursively merges objects.

## Requirements
- `deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T`
- Deep recursive merge, not shallow
- Handles arrays by replacing (not concatenating)
- Add tests in `src/utils/deep-merge.test.ts`

## Note
This tests --complexity override flag.

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody --complexity low

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1260-260410-022135` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24223129126))

To rerun: `@kody rerun 1260-260410-022135 --from <stage>`

