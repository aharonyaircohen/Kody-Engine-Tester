
### taskify (2026-04-18T16:47:53)
{"task_type":"feature","title":"Add config validator module in src/utils/","description":"Create src/utils/configValidator.ts with a config validation module and co-located tests (src/utils/configValidator.test.ts) following the existing single-responsibility utility module pattern. Uses vitest 4.0.18 for testing. The validator should validate configuration objects and return Result<T, E> for explicit error handling, consistent with src/utils/result.ts.","scope":["src/utils/configValidator.ts","
...(truncated)

### plan (2026-04-18T16:50:43)
I now have a thorough understanding of all existing patterns. Let me write the plan.

---

## Implementation Plan: `src/utils/configValidator.ts` with Tests

### Existing Patterns Found

- **`src/utils/result.ts`**: `Result<T, E>` discriminated union (`Ok`/`Err`), `ok()`, `err()`, `tryCatch()` — configValidator returns this type
- **`src/utils/debounce.ts`**: Single-function utility with typed `Options` interface, JSDoc comments, named exports
- **`src/utils/retry.ts`**: Configurable utility wit
...(truncated)

### build (2026-04-18T16:54:42)
All tasks complete. Here's a summary of what was implemented:

---

## Implementation Summary

### `src/utils/configValidator.ts`
A single-responsibility config validation module with:
- **`ValidationRule<T>`** union type covering all rule kinds (`required`, `minLength`, `maxLength`, `min`, `max`, `enum`, `custom`)
- **Rule factory functions** — `required()`, `minLength()`, `maxLength()`, `min()`, `max()`, `enumValue()`, `custom()`, `combine()`
- **`validate()`** — aggregates **all** field error
...(truncated)

### review (2026-04-18T16:57:44)
## Verdict: PASS

## Summary

Two new files added: `src/utils/configValidator.ts` (pure config validation utility with `validate`/`validateOne`, `ConfigValidators` factory object) and `src/utils/configValidator.test.ts` (15 co-located vitest tests). All 15 tests pass; no new TypeScript errors introduced.

## Findings

### Critical

None.

### Major

`src/utils/configValidator.ts:114` — `custom<T>`'s type guard `validate: (value: unknown) => value is T` is not actually a type guard (it returns a 
...(truncated)
