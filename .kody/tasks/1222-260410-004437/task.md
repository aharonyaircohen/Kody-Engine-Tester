# [mem-20260410-0022] M09: Add rate limit check

Create `checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfter?: number }` in `src/auth/rate-limiter-utils.ts` using in-memory Map. With tests

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1222-260410-004437` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24220593797))

To rerun: `@kody rerun 1222-260410-004437 --from <stage>`

