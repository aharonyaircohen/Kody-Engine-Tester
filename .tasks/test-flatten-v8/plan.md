The flatten tests pass (6/6). The only failure is in `api.int.spec.ts` which is unrelated — it needs a Payload CMS secret key that's an environment issue, not related to this task.

The implementation is complete:
- `src/utils/flatten.ts` — recursive `flatten<T>` function using a `NestedArray<T>` type
- `src/utils/flatten.test.ts` — 6 tests covering empty arrays, flat arrays, nested arrays, deeply nested, strings, and mixed types

All 6 flatten tests pass.
