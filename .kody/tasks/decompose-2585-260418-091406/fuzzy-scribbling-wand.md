# Plan: Add configValidator module

## Context

Task from `@kody decompose --no-compose` pipeline. The build stage requires adding a `configValidator.ts` utility module (with co-located tests) to validate CLI/config objects — particularly supporting flags like `--no-compose`. The module does not exist anywhere in the codebase yet.

## What to build

### `src/utils/configValidator.ts`

A schema-driven config validator that reuses:
- `src/utils/schema.ts` — `s` builder (`s.object()`, `s.string()`, etc.) + `SchemaError`
- `src/utils/result.ts` — `Result<T, E>` discriminated union (`ok()`, `err()`)

**Exports:**
- `ConfigError` — custom `Error` subclass with a descriptive message
- `validateConfig(raw: unknown): Result<Config, ConfigError>` — top-level validator
- `Config` — validated config object type (exported via `Infer` from schema)

**Validated fields:**
| Field             | Type      | Required | Notes                                      |
| ----------------- | --------- | -------- | ------------------------------------------ |
| `noCompose`       | `boolean` | no       | skips compose step                         |
| `composeFile`     | `string`  | no       | optional compose file override              |
| `parallelBuilds`  | `boolean` | no       | enable parallel builds                     |
| `maxConcurrency`  | `number`  | no       | positive integer; max number of workers    |
| `outputDir`       | `string`  | no       | override output directory                  |

**Implementation approach:**
```typescript
import { s, SchemaError } from './schema'
import { ok, err } from './result'

export class ConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigError'
  }
}

const configSchema = s.object({
  noCompose:     s.boolean().optional(),
  composeFile:   s.string().optional(),
  parallelBuilds: s.boolean().optional(),
  maxConcurrency: s.number().optional(),
  outputDir:     s.string().optional(),
})

export type Config = Infer<typeof configSchema>

export function validateConfig(raw: unknown): Result<Config, ConfigError> {
  try {
    const validated = configSchema.parse(raw)
    if (validated.maxConcurrency !== undefined && (validated.maxConcurrency <= 0 || !Number.isInteger(validated.maxConcurrency))) {
      return err(new ConfigError('maxConcurrency must be a positive integer'))
    }
    return ok(validated)
  } catch (e) {
    return err(new ConfigError((e as Error).message))
  }
}
```

### `src/utils/configValidator.test.ts`

Co-located vitest suite mirroring the pattern from `schema.test.ts` and `result.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { validateConfig, ConfigError } from './configValidator'
```

**Test cases:**
1. Valid minimal config (`{}`) → `ok({})`
2. Valid full config with all fields → `ok` with all fields
3. `noCompose: true` → `ok` with `noCompose: true`
4. `maxConcurrency: 4` → `ok`
5. `maxConcurrency: 0` → `err` ("maxConcurrency must be a positive integer")
6. `maxConcurrency: -1` → `err`
7. `maxConcurrency: 2.5` → `err`
8. Non-object input (`null`, `[]`, `"string"`, `42`) → `err`
9. Unknown extra fields in config → silently ignored (schema only validates defined keys)
10. All optional fields: `undefined` values → `ok`

## Critical files

- `src/utils/configValidator.ts` — **new file**
- `src/utils/configValidator.test.ts` — **new file**
- `src/utils/schema.ts` — reused (no changes)
- `src/utils/result.ts` — reused (no changes)

## Verification

1. `pnpm tsc --noEmit` — zero TypeScript errors
2. `pnpm test:int` — vitest suite passes
3. Manual: import and call `validateConfig({ noCompose: true, maxConcurrency: 4 })` → returns `Ok`
