import { ok, err, type Result } from './result'

export interface DebounceConfig {
  delay: number
  maxWait?: number
}

const MAX_WAIT_BOUND = 10000

export type DebounceConfigValidationResult = Result<DebounceConfig, string>

export function validateDebounceConfig(config: DebounceConfig): DebounceConfigValidationResult {
  if (typeof config.delay !== 'number' || !Number.isFinite(config.delay)) {
    return err('delay must be a finite number')
  }

  if (config.delay < 0) {
    return err('delay cannot be negative')
  }

  if (config.maxWait !== undefined) {
    if (typeof config.maxWait !== 'number' || !Number.isFinite(config.maxWait)) {
      return err('maxWait must be a finite number')
    }

    if (config.maxWait < 0) {
      return err('maxWait cannot be negative')
    }

    if (config.maxWait > MAX_WAIT_BOUND) {
      return err(`maxWait cannot exceed ${MAX_WAIT_BOUND}ms`)
    }
  }

  return ok(config)
}
