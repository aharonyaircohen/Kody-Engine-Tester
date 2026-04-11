
### taskify (2026-04-11T15:46:19)
{
  "task_type": "feature",
  "title": "Add parseJsonSafe utility function",
  "description": "Add a `parse-json-safe` utility in `src/utils/parse-json-safe.ts` that safely parses JSON strings using try-catch, returning null instead of throwing on invalid JSON. Should include co-located test file following existing utility patterns.",
  "scope": ["src/utils/parse-json-safe.ts", "src/utils/parse-json-safe.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/retry.ts - single-
...(truncated)

### build (2026-04-11T15:48:29)
The implementation is complete. Here's a summary:

## Created Files

**`src/utils/parse-json-safe.ts`**
- Simple utility function that wraps `JSON.parse()` in try-catch
- Returns `T | null` - parsed value or null on error
- Generic type parameter `T` defaults to `unknown`

**`src/utils/parse-json-safe.test.ts`**
- 8 tests covering valid JSON objects, arrays, primitives, invalid JSON, edge cases (trailing commas, whitespace)

## Test Results
```
✓ src/utils/parse-json-safe.test.ts (8 tests) 5ms
`
...(truncated)
