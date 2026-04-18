import type { Result } from '@/utils/result'
import { ok, err } from '@/utils/result'

/** Validated Kody task configuration. */
export interface KodyConfig {
  /** Short description of what the task does. Required. */
  description: string
  /** When true, stop after parallel builds and skip the compose step. Mutually exclusive with compose and composeAll. */
  noCompose?: boolean
  /** When true, run the compose step after parallel builds. Mutually exclusive with noCompose. */
  compose?: boolean
  /** When true, run the compose-all step after parallel builds. Mutually exclusive with noCompose. */
  composeAll?: boolean
  /** List of build target identifiers (e.g. 'src', 'dist'). */
  buildTargets?: string[]
  /** Path to the entry point file (e.g. 'src/index.ts'). */
  entryPoint?: string
}

/** Describes a single validation failure. */
export interface ValidationError {
  /** The config field that failed validation, or 'root' for top-level structure errors. */
  field: string
  /** Human-readable explanation of why the field failed. */
  message: string
}

/**
 * Validates an unknown value against the KodyConfig schema.
 *
 * Enforces:
 * - `description` is a required non-empty string
 * - `noCompose`, `compose`, `composeAll` must be booleans when present
 * - `buildTargets` must be an array when present
 * - `entryPoint` must be a string when present
 * - `--no-compose` (`noCompose: true`) is mutually exclusive with `--compose` and `--compose-all`
 *
 * All validation errors are collected before returning, so callers receive the full list.
 *
 * @param config - The raw value to validate (typically parsed from CLI flags or JSON).
 * @returns `Ok<KodyConfig>` when the config is valid, `Err<ValidationError[]>` otherwise.
 *
 * @example
 * const result = validateConfig({ description: 'Build the API', noCompose: true })
 * if (result.isOk()) {
 *   const config = result.unwrap()
 *   // config.noCompose === true
 * } else {
 *   const errors = result.unwrapOr([])
 *   errors.forEach((e) => console.error(`${e.field}: ${e.message}`))
 * }
 */
export function validateConfig(config: unknown): Result<KodyConfig, ValidationError[]> {
  if (typeof config !== 'object' || config === null) {
    return err([{ field: 'root', message: 'Config must be a non-null object' }])
  }

  const c = config as Record<string, unknown>
  const errors: ValidationError[] = []

  // Required: description
  if (
    !c.description ||
    typeof c.description !== 'string' ||
    c.description.trim() === ''
  ) {
    errors.push({
      field: 'description',
      message: 'description is required and must be a non-empty string',
    })
  }

  // Type constraint: noCompose
  if (c.noCompose !== undefined && typeof c.noCompose !== 'boolean') {
    errors.push({ field: 'noCompose', message: 'noCompose must be a boolean' })
  }

  // Type constraint: compose
  if (c.compose !== undefined && typeof c.compose !== 'boolean') {
    errors.push({ field: 'compose', message: 'compose must be a boolean' })
  }

  // Type constraint: composeAll
  if (c.composeAll !== undefined && typeof c.composeAll !== 'boolean') {
    errors.push({ field: 'composeAll', message: 'composeAll must be a boolean' })
  }

  // Type constraint: buildTargets
  if (c.buildTargets !== undefined && !Array.isArray(c.buildTargets)) {
    errors.push({ field: 'buildTargets', message: 'buildTargets must be an array of strings' })
  }

  // Type constraint: entryPoint
  if (c.entryPoint !== undefined && typeof c.entryPoint !== 'string') {
    errors.push({ field: 'entryPoint', message: 'entryPoint must be a string' })
  }

  // Mutual exclusivity: --no-compose vs --compose / --compose-all
  if (c.noCompose === true && (c.compose === true || c.composeAll === true)) {
    errors.push({
      field: 'noCompose',
      message: '--no-compose is mutually exclusive with --compose and --compose-all',
    })
  }

  if (errors.length > 0) {
    return err(errors)
  }

  return ok(c as unknown as KodyConfig)
}
