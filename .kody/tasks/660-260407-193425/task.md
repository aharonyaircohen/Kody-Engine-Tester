# [mem-20260407-2209] M09: Add rate limit check

Create `checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfter?: number }` in `src/auth/rate-limiter-utils.ts` using in-memory Map. With comprehensive tests

---

## Discussion (2 comments)

**@aguyaharonyair** (2026-04-07):
@kody

**@aharonyaircohen** (2026-04-07):
🚀 Kody pipeline started: `660-260407-193425` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24100546763))

To rerun: `@kody rerun 660-260407-193425 --from <stage>`

