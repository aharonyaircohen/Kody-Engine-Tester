
### taskify (2026-04-09T15:03:53)

{
  "task_type": "feature",
  "title": "Add isNumber type guard utility",
  "description": "Add a simple isNumber(value: unknown): value is number type guard to src/utils/number.ts with unit tests using Vitest. The implementation should follow existing utility patterns (single-function files with co-located .test.ts files).",
  "scope": ["src/utils/number.ts", "src/utils/number.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/clamp.ts - single-function utility with type
...(truncated)

### build (2026-04-09T15:07:00)

All TypeScript errors are pre-existing issues unrelated to my changes. My implementation is complete:

**Created files:**

1. **`src/utils/number.ts`** - Type guard that checks if a value is a number and not NaN:
   ```typescript
   export function isNumber(value: unknown): value is number {
     return typeof value === 'number' && !Number.isNaN(value)
   }
   ```

2. **`src/utils/number.test.ts`** - Comprehensive tests covering:
   - Integers (positive and negative)
   - Floating point numbers
...(truncated)
