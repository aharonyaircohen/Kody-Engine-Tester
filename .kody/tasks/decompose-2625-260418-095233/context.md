
### taskify (2026-04-18T09:57:31)
Here's what I've found and my proposed plan:

---

## Classification

**`src/utils/configValidator.ts`** — this file does **not** exist yet. The task is to create it.

---

## Pattern Discovery

| Pattern | Source | How to reuse |
|---|---|---|
| Single-function utility files | `src/utils/debounce.ts`, `flatten.ts` | New file at `src/utils/configValidator.ts` |
| Co-located tests | `src/utils/*.test.ts` | `configValidator.test.ts` next to source |
| `Result<T, E>` discriminated union | `src/util
...(truncated)

### build (2026-04-18T09:59:07)

The plan is ready. I've analyzed the codebase and created a detailed plan to implement `src/utils/configValidator.ts` with:

1. **`configValidator.ts`** — validates `kody.config.json` using `Result<KodyConfig, ConfigValidationError[]>` with full field-level validation (required keys, types, enums, URL format) and error aggregation
2. **`configValidator.test.ts`** — comprehensive co-located tests covering valid/invalid configs, type errors, enum violations, and multiple aggregated errors

Key pa
...(truncated)
