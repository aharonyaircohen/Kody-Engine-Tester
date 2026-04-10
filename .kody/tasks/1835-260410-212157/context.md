
### taskify (2026-04-10T21:49:37)
{
  "task_type": "feature",
  "title": "Add add() utility function to math.ts",
  "description": "Create src/utils/math.ts with a simple add() function that returns the sum of two numbers, along with co-located tests in math.test.ts following existing utility patterns.",
  "scope": [
    "src/utils/math.ts",
    "src/utils/math.test.ts"
  ],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/sum.ts — default export, single function per file pattern",
    "src/utils/clamp.ts — named e
...(truncated)

### build (2026-04-10T21:51:33)
The implementation is complete:

**Created files:**
- `src/utils/math.ts` — named export `add(a: number, b: number)` function
- `src/utils/math.test.ts` — 6 tests covering positive, negative, zero, and floating-point cases

**Verification:**
- All 6 tests pass
- No type errors in the new files

