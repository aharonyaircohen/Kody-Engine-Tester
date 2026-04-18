/**
 * Auth-specific rate limiter singletons.
 * Exported separately so tests can call .reset() between test runs.
 * Each route handler imports from here rather than creating its own module-level instance.
 */
import { SlidingWindowRateLimiter } from './rate-limiter'

export const loginRateLimiter = new SlidingWindowRateLimiter({
  maxRequests: 10,
  windowMs: 15 * 60 * 1000,
  cleanupIntervalMs: 60_000,
})

export const registerRateLimiter = new SlidingWindowRateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
  cleanupIntervalMs: 60_000,
})
