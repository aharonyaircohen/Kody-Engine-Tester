
### taskify (2026-04-10T08:16:02)
{"task_type":"feature","title":"Add retry utility with exponential backoff","description":"Create retry<T>(fn: () => Promise<T>, maxAttempts: number, delayMs: number): Promise<T> in src/utils/async-helpers.ts with exponential backoff and co-located tests. The function should retry failed async operations with configurable max attempts and delay between retries.","scope":["src/utils/async-helpers.ts","src/utils/async-helpers.test.ts"],"risk_level":"low","existing_patterns":["src/utils/retry.ts - 
...(truncated)

### build (2026-04-10T08:20:12)
Implementation complete. Summary:

**Created files:**
- `src/utils/async-helpers.ts` - retry utility with signature `retry<T>(fn: () => Promise<T>, maxAttempts: number, delayMs: number): Promise<T>`
- `src/utils/async-helpers.test.ts` - 7 tests using vitest fake timers

**Implementation:**
- Retries failed async operations up to `maxAttempts` times
- Exponential backoff: delay doubles after each retry (`delayMs * 2^attempt`)
- Throws the last error if all attempts fail
- Handles both Error objec
...(truncated)
