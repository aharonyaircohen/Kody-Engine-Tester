import { err, ok, type Result } from './result'

export interface EnvVar {
  name: string
  value: string | undefined
}

export interface EnvValidationResult {
  missing: string[]
  present: string[]
}

/**
 * Validates that required environment variables are present.
 * Returns a Result containing the validation result or an error listing missing variables.
 */
export function validateEnv(required: string[]): Result<EnvValidationResult, Error> {
  if (!Array.isArray(required)) {
    return err(new Error('required must be an array of environment variable names'))
  }

  const missing: string[] = []
  const present: string[] = []

  for (const varName of required) {
    if (typeof varName !== 'string' || varName.trim() === '') {
      return err(new Error('each required variable name must be a non-empty string'))
    }

    const value = process.env[varName]
    if (value === undefined || value === '') {
      missing.push(varName)
    } else {
      present.push(varName)
    }
  }

  if (missing.length > 0) {
    return err(
      new Error(`Missing required environment variables: ${missing.join(', ')}`)
    )
  }

  return ok({ missing, present })
}

/**
 * Gets an environment variable value, throwing if it's not present.
 * Use this during application startup to eagerly validate required vars.
 */
export function requireEnv(varName: string): string {
  const value = process.env[varName]
  if (value === undefined || value === '') {
    throw new Error(`Required environment variable ${varName} is not set`)
  }
  return value
}

/**
 * Gets an optional environment variable value, returning a default if not present.
 */
export function optionalEnv(varName: string, defaultValue: string): string {
  const value = process.env[varName]
  if (value === undefined || value === '') {
    return defaultValue
  }
  return value
}
