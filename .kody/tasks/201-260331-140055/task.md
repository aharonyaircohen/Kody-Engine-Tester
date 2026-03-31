# [test-suite] Add middleware with tests

Add a request logging middleware to the Express app:

1. Create src/middleware/requestLogger.ts that logs method, URL, status code, and response time. Attaches a unique request ID. Sets X-Request-ID response header. Skips health check endpoints.

2. Create tests in src/middleware/requestLogger.test.ts.

3. Register the middleware in the app (before routes).