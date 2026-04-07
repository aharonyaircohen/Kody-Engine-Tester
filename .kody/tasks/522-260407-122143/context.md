
### build (2026-04-07T12:32:27)
The `clamp` utility function is already implemented and all tests pass. The implementation meets all acceptance criteria:

- **Export**: `export function clamp(value: number, min: number, max: number): number`
- **Returns `min`** if value < min
- **Returns `max`** if value > max  
- **Returns `value`** if within range
- **Tests** in `src/utils/clamp.test.ts` — all 8 tests pass

The function also includes a bonus edge case: it throws an error when `min > max`.

