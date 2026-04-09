
### taskify (2026-04-09T23:37:45)
```json
{
  "task_type": "refactor",
  "title": "Move clamp utility to math-helpers.ts",
  "description": "Move the clamp function from src/utils/clamp.ts into a new src/utils/math-helpers.ts file and create co-located tests at src/utils/math-helpers.test.ts. The function signature is clamp(value: number, min: number, max: number): number.",
  "scope": [
    "src/utils/clamp.ts",
    "src/utils/clamp.test.ts",
    "src/utils/math-helpers.ts",
    "src/utils/math-helpers.test.ts"
  ],
  "risk_lev
...(truncated)

### build (2026-04-09T23:40:13)
Implementation complete. Here's what was done:

**Created:**
- `src/utils/math-helpers.ts` - Contains the `clamp(value, min, max)` function
- `src/utils/math-helpers.test.ts` - Co-located tests with 8 test cases

**Modified:**
- `src/utils/clamp.ts` - Now re-exports from `math-helpers.ts` for backwards compatibility

**Test Results:**
- `math-helpers.test.ts`: 8 tests passed
- `clamp.test.ts`: 8 tests passed (backwards compatibility verified)

All tests pass. The `clamp` function is now availabl
...(truncated)
