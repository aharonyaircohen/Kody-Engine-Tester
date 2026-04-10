# [mem-20260410-0601] M09: Add rate limit check

Create `checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfter?: number }` in `src/auth/rate-limiter-utils.ts` using in-memory Map. With tests

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1388-260410-062622` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24229673450))

To rerun: `@kody rerun 1388-260410-062622 --from <stage>`

