# Plan: Create configValidator.ts utility

## Context

The task is to create a new config validator utility at `src/utils/configValidator.ts` that validates `kody.config.json` configuration objects. This follows the established pattern of single-function utility files in `src/utils/` (e.g., `isbn-validator.ts`, `debounce.ts`) and uses the `Result<T, E>` discriminated union from `src/utils/result.ts`.

## What to create

### `src/utils/configValidator.ts`

A validator function `validateKodyConfig(config: unknown): Result<KodyConfig, ConfigValidationError[]>` that:

1. **Type narrowing**: Guards against non-object/null input, then narrows to `Record<string, unknown>`
2. **Required top-level keys**: `quality`, `git`, `github`, `agent`, `mcp`, `devServer`, `watch` must all be present
3. **Field-specific validation**:
   - `quality.typecheck` / `quality.lint` / `quality.testUnit`: non-empty string
   - `git.defaultBranch`: non-empty string
   - `github.owner` / `github.repo`: non-empty string
   - `agent.modelMap`: object with `cheap`, `mid`, `strong` as non-empty strings
   - `mcp.enabled`: boolean
   - `mcp.stages`: array of strings (each from `['build', 'review']`)
   - `devServer.command`: non-empty string
   - `devServer.url`: valid URL string
   - `watch.enabled`: boolean
4. **Returns**: `Result<KodyConfig, ConfigValidationError[]>` using the class-based `Ok`/`Err` from `src/utils/result.ts`
5. **Error aggregation**: Collects all validation errors (not short-circuiting on first), so all problems are reported at once

### `src/utils/configValidator.test.ts`

Co-located tests covering:
- Valid config passes with `Ok`
- Missing required top-level key → `Err` with field name
- Wrong type for known fields → `Err`
- Invalid `mcp.stages` array values → `Err`
- Invalid `devServer.url` (not a valid URL) → `Err`
- Null/undefined/empty object input → `Err`
- Valid config with all optional fields present → `Ok`
- Multiple errors aggregated in a single `Err`

## Verification

```bash
cd /home/runner/work/Kody-Engine-Tester/Kody-Engine-Tester
pnpm test src/utils/configValidator.test.ts
pnpm tsc --noEmit
```

## Reused patterns

| Pattern | File |
|---|---|
| `Ok`/`Err` Result classes | `src/utils/result.ts` |
| Single-function utility layout | `src/utils/isbn-validator.ts` |
| Co-located test layout | `src/utils/isbn-validator.test.ts` |
| Input guard + aggregation pattern | (learned from `isbn-validator.ts` null checks) |
