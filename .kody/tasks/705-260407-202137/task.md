# [mem-20260407-2007] Add rate limit check

Create `checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfter?: number }` in `src/auth/rate-limiter-utils.ts` using in-memory Map. With tests

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `705-260407-202137` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24102524258))

To rerun: `@kody rerun 705-260407-202137 --from <stage>`

