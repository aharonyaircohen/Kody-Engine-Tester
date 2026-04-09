# [mem-20260409-2331] M09: Add rate limit check

Create `checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfter?: number }` in `src/auth/rate-limiter-utils.ts` using in-memory Map. With tests

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `1122-260409-233707` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24218639228))

To rerun: `@kody rerun 1122-260409-233707 --from <stage>`

