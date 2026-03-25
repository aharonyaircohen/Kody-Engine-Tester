The `flatten` tests all **pass** (6/6). The failure is unrelated — it's in `tests/int/api.int.spec.ts` which requires a Payload CMS secret key (environment config issue, not related to this task).

The task is already complete:

- **`src/utils/flatten.ts`** — recursive generic `flatten<T>` function
- **`src/utils/flatten.test.ts`** — 6 tests covering: nested arrays, empty array, flat array, strings, deeply nested, mixed types

All 6 flatten tests pass.
