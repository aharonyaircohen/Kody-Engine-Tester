
### taskify (2026-04-03T21:59:44)
{
  "task_type": "feature",
  "title": "Add isEven utility function",
  "description": "Create isEven/isOdd utility function in src/utils/is-even.ts with corresponding vitest tests in src/utils/is-even.test.ts. Follow the existing simple utility pattern (like cap.ts).",
  "scope": ["src/utils/is-even.ts", "src/utils/is-even.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/cap.ts — simple single-responsibility utility export pattern",
    "src/utils/cap.test.ts — vitest t
...(truncated)

### build (2026-04-03T22:01:17)
Done. Created both files:

- `src/utils/is-even.ts` — exports `isEven` and `isOdd` functions
- `src/utils/is-even.test.ts` — 4 tests covering both functions with positive/negative numbers and edge case (0)

All tests pass and TypeScript compiles without errors.

