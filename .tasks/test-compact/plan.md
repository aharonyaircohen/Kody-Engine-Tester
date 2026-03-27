The compact tests pass (13/13). The only failure is an unrelated integration test that requires a Payload CMS secret key — not related to this task.

The implementation is already complete:
- `src/utils/compact.ts` — exports `compact<T>()` using `arr.filter(Boolean)`
- `src/utils/compact.test.ts` — 13 tests covering all falsy values (null, undefined, 0, false, `''`, NaN), empty arrays, mixed types, and objects

All 13 compact tests pass.
