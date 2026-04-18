
### taskify (2026-04-18T13:17:59)
{"task_type":"feature","title":"Add config validator module with tests","description":"Add a new config validator module at src/utils/configValidator.ts following the existing single-function utility pattern, with co-located unit tests in src/utils/configValidator.test.ts. The Project Memory documents that utility modules in src/utils/ are single-function files with co-located .test.ts files, using vitest for testing. The module should validate configuration objects and return explicit error res
...(truncated)

### build (2026-04-18T13:21:33)
Implementation complete. Here's a summary of what was delivered:

---

## `src/utils/configValidator.ts`

A single-responsibility config validation module following the existing `src/utils/` pattern:

- **`ValidationError`** — class with `field` and `message` properties for structured error reporting
- **`FieldValidator<T>`** — typed function: `(value: unknown, field: string) => Result<T, ValidationError>`
- **Primitive validators**: `string`, `number`, `boolean`, `array`
- **Combinators**: `opt
...(truncated)
