All 48 unit tests pass, including all 8 `pick` tests. The implementation looks good:

- `src/utils/pick.ts` — typed generic function using `Pick<T, K>` return type, iterates keys with `key in obj` guard (handles missing keys correctly), builds a new object (no mutation)
- `src/utils/pick.test.ts` — 8 tests covering: basic picking, empty keys, non-existent keys, immutability, all keys, various value types, new reference, empty source object
