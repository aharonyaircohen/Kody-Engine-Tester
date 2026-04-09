
### taskify (2026-04-09T14:34:55)
Done. Created `src/utils/async-helpers.ts` with:

```typescript
retry<T>(fn: () => Promise<T>, maxAttempts: number, delayMs: number): Promise<T>
```

Features:
- Exponential backoff: delay doubles each retry (`delayMs * 2^attempt`)
- Throws the last error if all attempts fail
- All 7 tests pass


### build (2026-04-09T14:36:52)
The `retry` utility implementation is complete and verified:

**Implementation Summary:**

`src/utils/async-helpers.ts` contains:
- `retry<T>(fn: () => Promise<T>, maxAttempts: number, delayMs: number): Promise<T>`
- Exponential backoff: delay doubles each retry (`delayMs * 2^attempt`)
- Throws the last error if all attempts fail

**Test Results:**
- All 7 tests pass
- Uses `vi.useFakeTimers()` for proper async testing
- Covers: first attempt success, retries with eventual success, max attempts 
...(truncated)
