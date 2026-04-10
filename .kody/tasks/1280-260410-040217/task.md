# [mem-20260410-0349] M09: Add rate limit check

Create `checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfter?: number }` in `src/auth/rate-limiter-utils.ts` using in-memory Map. With tests

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1280-260410-040217` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24225695360))

To rerun: `@kody rerun 1280-260410-040217 --from <stage>`

