# Test MCP registry: add utils/retry.ts

Add a simple retry utility to utils/retry.ts that exports a retryWithBackoff function with configurable maxAttempts, initialDelay, and backoff multiplier