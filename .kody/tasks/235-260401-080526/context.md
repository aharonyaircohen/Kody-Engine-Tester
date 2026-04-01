
### build (2026-04-01T08:08:22)
Done. Created two files:

- **`src/utils/shuffle.ts`** — Fisher-Yates shuffle with optional `seed` parameter using a mulberry32 PRNG for reproducible results
- **`src/utils/shuffle.test.ts`** — 11 tests covering: same elements, non-mutation, random variation, seeded reproducibility, different seeds, empty/single-element arrays, strings, objects, mixed types, and two-element edge case

All 11 tests pass and TypeScript is clean on both files.

