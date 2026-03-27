All 5 `unique` tests pass. The failure is unrelated — it's `tests/int/api.int.spec.ts` failing due to a missing Payload CMS secret key (an environment config issue, not related to our changes).

The implementation is complete:

- **`src/utils/unique.ts`** — exports `unique<T extends string | number>(arr: T[]): T[]` using `Set` for deduplication
- **`src/utils/unique.test.ts`** — 5 tests covering empty array, duplicate numbers, duplicate strings, no duplicates, and order preservation
