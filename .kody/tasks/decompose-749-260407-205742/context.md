
### taskify (2026-04-07T21:00:40)
All tests pass. Here's the classification:

```json
{
  "task_type": "feature",
  "title": "Add identity utility function",
  "description": "Add a generic identity utility function in src/utils/identity.ts that returns its input unchanged, with full test coverage including number, string, object, array, null, undefined, and boolean cases.",
  "scope": ["src/utils/identity.ts", "src/utils/identity.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/reverse.ts - single-funct
...(truncated)

### build (2026-04-07T21:02:16)
These TypeScript errors are pre-existing and unrelated to the identity utility. The identity function itself is correctly typed.

## Summary

The `identity` utility function is already implemented and passing all tests:

**Implementation** (`src/utils/identity.ts`):
```typescript
export function identity<T>(value: T): T {
  return value
}
```

**Tests** (`src/utils/identity.test.ts`): 7 tests covering:
- Numbers: `identity(5)` returns `5` ✓
- Strings: `identity('hello')` returns `'hello'` ✓
- Ob
...(truncated)
