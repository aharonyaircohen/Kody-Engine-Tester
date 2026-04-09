# [mem-20260409-1611] M09: Add rate limit check

Create `checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfter?: number }` in `src/auth/rate-limiter-utils.ts` using in-memory Map. With tests

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `897-260409-162922` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24201415416))

To rerun: `@kody rerun 897-260409-162922 --from <stage>`

