# Add rate limit headers to API responses

## Feature Request

Add standard rate limit headers to all API responses so clients know their remaining quota.

**Files:** `src/middleware/rate-limiter.ts`

**Requirements:**
- Add these headers to every response that passes through the rate limiter:
  - \`X-RateLimit-Limit\`: max requests per window
  - \`X-RateLimit-Remaining\`: remaining requests in current window
  - \`X-RateLimit-Reset\`: UTC epoch seconds when window resets
- When rate limited (429), also include \`Retry-After\` header (seconds until reset)
- Add tests verifying headers are present and values decrement correctly

**Complexity:** low