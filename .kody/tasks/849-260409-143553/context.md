
### taskify (2026-04-09T14:37:35)
```json
{
  "task_type": "refactor",
  "title": "Add clamp utility to math-helpers.ts",
  "description": "Move clamp(value: number, min: number, max: number): number from src/utils/clamp.ts to src/utils/math-helpers.ts. The function already exists with tests in clamp.ts. Create the new math-helpers.ts file and update/replace clamp.ts accordingly.",
  "scope": [
    "src/utils/clamp.ts",
    "src/utils/clamp.test.ts",
    "src/utils/math-helpers.ts"
  ],
  "risk_level": "low",
  "existing_pattern
...(truncated)

### build (2026-04-09T14:41:25)
The task is complete:

1. **Created** `src/utils/math-helpers.ts` with the `clamp` function
2. **Updated** `src/utils/clamp.test.ts` to import from `math-helpers` instead of `clamp`
3. **Deleted** `src/utils/clamp.ts`

All 8 clamp tests pass. The implementation follows the existing single-function utility pattern in the codebase (similar to `src/utils/cap.ts`).

