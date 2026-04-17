# Plan: configValidator.ts + configValidator.test.ts

## Context

The task is to implement `src/utils/configValidator.ts` and its co-located test suite
`src/utils/configValidator.test.ts`. This validator module validates configuration objects
produced/consumed by the `@kody decompose --no-compose` pipeline — specifically ensuring
that when `noCompose: true` is set, post-build phases (`merge`, `verify`, `review`, `ship`)
are correctly marked as inactive.

The project conventions require:
- Named exports for utilities
- `Result<T, E>` discriminated union from `src/utils/result.ts` for error handling
- The `Validator<T>` / `ValidatorResult` pattern from `src/validation/validators.ts`
- Single-responsibility utilities in `src/utils/` with co-located `.test.ts`
- Vitest with `describe`/`it`/`expect` (no `test` alias)

---

## Files to create

### `src/utils/configValidator.ts`

Defines the types, config schema, and validator functions for decompose configs.

**Types**
- `DecomposePhase` — union of phase strings: `'build' | 'merge' | 'verify' | 'review' | 'ship'`
- `DecomposeConfig` — shape: `{ noCompose?: boolean; phases?: Partial<Record<DecomposePhase, boolean>>; statePath?: string }`
- `DecomposeState` — shape: `{ currentPhase?: DecomposePhase; completed?: boolean; error?: string }`

**Validators** (follow `Validator<T>` / `ValidatorResult` pattern from `src/validation/validators.ts`)

| Export | Input | Validation |
|--------|-------|------------|
| `validateDecomposeConfig` | `unknown` | not null/undefined; `phases` key values must be boolean; `noCompose` must be boolean if present |
| `validateDecomposePhase` | `unknown` | must be one of the 5 phase strings |
| `validateDecomposeState` | `unknown` | is object; `currentPhase` valid phase if present; `completed` boolean if present |
| `validateNoCompose` | `DecomposeConfig` | `noCompose === true` → all post-build phases (`merge`, `verify`, `review`, `ship`) must be `false` or absent |
| `validateBuildPhases` | `DecomposeConfig` | `build` phase must not be explicitly `false` |

All validators return `ValidatorResult`: `{ valid: true }` or `{ valid: false; error: string }`.

---

### `src/utils/configValidator.test.ts`

Comprehensive vitest test suite. Tests follow the pattern in `src/utils/retry.test.ts` and
`src/validation/validators.test.ts` — group by function, cover happy path and edge cases.

**Edge cases to test (per function):**
- null / undefined input
- wrong type (e.g., string instead of object)
- extra/unexpected keys
- empty object
- valid inputs
- boundary values

**Additional test groups:**
- `validateNoCompose`: `noCompose: true` with post-build phases all `false` (valid); `noCompose: true` with `merge: true` (invalid); `noCompose: false` / absent (valid regardless of phases)
- `validateBuildPhases`: `build: false` (invalid); `build: true` (valid); `build` absent (valid)

---

## Implementation details

- Follow existing `Validator<T>` convention from `src/validation/validators.ts` (no need to import `Result`)
- Do NOT use Zod — use plain TypeScript + manual validation (consistent with existing validators)
- No external dependencies beyond the project's own modules
- All exports are named (no default export per conventions)

---

## Verification

After writing both files:
1. Run `pnpm tsc --noEmit` — must produce zero type errors
2. Run `pnpm test:int src/utils/configValidator.test.ts` — all tests must pass
3. If the project has a `pnpm lint` step, run it on the new files
