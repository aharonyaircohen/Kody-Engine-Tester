# Add a rate limiter middleware with sliding window algorithm

Create a rate limiter middleware that:

1. Uses a sliding window algorithm (not fixed window) to track request rates
2. Supports per-IP and per-API-key rate limiting
3. Configurable: max requests, window size in seconds
4. Returns 429 Too Many Requests with Retry-After header when limit exceeded
5. Stores state in-memory (Map-based, no external dependencies)
6. Has comprehensive tests covering: normal flow, rate exceeded, window sliding, multiple IPs, cleanup of expired entries

Save to:
- src/middleware/rate-limiter.ts
- src/middleware/rate-limiter.test.ts

This is a security-critical component — ensure proper edge case handling.