
### taskify (2026-04-10T06:09:51)
Based on my exploration, there's already a comprehensive `retry.ts` implementation with exponential backoff in `src/utils/retry.ts`. The task description asks for a specific signature `retry<T>(fn: () => Promise<T>, maxAttempts: number, delayMs: number)` in a new file `async-helpers.ts`.

**Recommendations to reply to Kody:**

1. **Use `src/utils/retry.ts`** — The existing implementation already has exponential backoff with `maxRetries`, `initialDelay`, `backoffFactor`, `maxDelay`, and `shouldRe
...(truncated)

### build (2026-04-10T06:12:35)
Implementation complete. Here's a summary:

**Created files:**
- `src/utils/async-helpers.ts` - retry utility with exponential backoff
- `src/utils/async-helpers.test.ts` - 6 tests covering all cases

**Implementation:**
```typescript
retry<T>(fn: () => Promise<T>, maxAttempts: number, delayMs: number): Promise<T>
```

Uses exponential backoff where each retry delay doubles: `delayMs * 2^attempt`.

**Tests (all passing):**
- First attempt success
- Retry and succeed on second attempt  
- Max att
...(truncated)
