# Test MCP registry: add utils/retry.ts

Add a simple retry utility to utils/retry.ts that exports a retryWithBackoff function with configurable maxAttempts, initialDelay, and backoff multiplier

---

## Discussion (3 comments)

**@aharonyaircohen** (2026-04-15):
🚀 Kody pipeline started: `live-test-1776270990`

**@aharonyaircohen** (2026-04-15):
🏗️ **Kody has architecture questions:**

1. None — the parameter semantics (`maxAttempts` = total attempts) align with existing `retry-queue.ts` usage, so the `maxAttempts - 1` conversion is a reasonable interpretation.

Reply with `@kody approve` and your answers in the comment body.

**@aharonyaircohen** (2026-04-15):
🚀 Kody pipeline started: `live-test-1776274739`

