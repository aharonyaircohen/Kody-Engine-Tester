
### taskify (2026-04-07T19:13:56)

Now I have all the context I need. Let me output the classification.

```json
{
  "task_type": "feature",
  "title": "Add retry utility to async-helpers.ts",
  "description": "Create `retry<T>(fn: () => Promise<T>, maxAttempts: number, delayMs: number): Promise<T>` in `src/utils/async-helpers.ts` with exponential backoff. The function should retry failed operations up to maxAttempts times with delayMs as the base delay, doubling each retry (exponential backoff). Include comprehensive tests in `
...(truncated)

### build (2026-04-07T19:17:58)
Implementation complete. Here's a summary:

**Created `src/utils/async-helpers.ts`** with the `retry` function:
- Uses positional parameters: `retry<T>(fn: () => Promise<T>, maxAttempts: number, delayMs: number)`
- Implements exponential backoff: delay doubles after each retry (`delayMs * 2^attempt`)
- Throws the last error if all attempts fail

**Created `src/utils/async-helpers.test.ts`** with 11 comprehensive tests:
- First attempt success
- Retry and success on second attempt  
- Max attempt
...(truncated)
