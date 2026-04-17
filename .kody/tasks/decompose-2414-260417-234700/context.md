
### taskify (2026-04-17T23:53:33)
The plan is ready for your review. Here's a summary of what it proposes:

**Task**: Add `src/utils/configValidator.ts` + `src/utils/configValidator.test.ts`

**Approach**: Reuse the existing mini-Zod schema builder (`src/utils/schema.ts` — the `s` API) and `Result<T, E>` type from `src/utils/result.ts` to build a validated `KodyConfig` type from `kody.config.json`. The validator function returns `Result<KodyConfig, SchemaError>` for explicit error handling.

**Scope**: 2 new files in `src/utils/
...(truncated)

### build (2026-04-17T23:55:04)
The plan is ready for review. It proposes adding two files:

- **`src/utils/configValidator.ts`** — Defines a `KodyConfig` interface matching `kody.config.json`, builds a schema with `s.object(...)` from the existing mini-Zod builder, and exports `validateKodyConfig(input: unknown): Result<KodyConfig, SchemaError>` using `tryCatch`.
- **`src/utils/configValidator.test.ts`** — Tests covering valid full/partial/empty configs returning `Ok`, and invalid inputs returning `Err` with the `SchemaError`
...(truncated)
