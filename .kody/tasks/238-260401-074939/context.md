
### taskify (2026-04-01T07:57:46)
Done. Created:

- **`src/utils/map-keys.ts`** - The `mapKeys` utility function that transforms object keys using a mapping function `(value, key, index) => newKey`
- **`src/utils/map-keys.test.ts`** - 14 tests covering key transformations, value preservation, edge cases (empty objects, various value types, kebab/snake case)

All 1667 tests pass.


### build (2026-04-01T07:58:13)
All 14 tests pass. The implementation is complete:

- **`src/utils/map-keys.ts`** - Generic `mapKeys` function with signature `<T extends object, K extends string>(obj: T, fn: (value, key, index) => K) => Record<K, T[keyof T]>`
- **`src/utils/map-keys.test.ts`** - 14 tests covering transformations, edge cases, and value preservation

