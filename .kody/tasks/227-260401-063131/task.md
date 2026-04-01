# [test-suite] Add request correlation ID middleware with logging

Create a correlation ID middleware in src/middleware/correlation-id.ts that:
1. Generates a unique request ID (UUID v4) for each incoming request
2. Attaches it to the request object and response headers (X-Correlation-ID)
3. Creates a request logger in src/middleware/request-logger.ts that logs request method, path, status code, duration, and correlation ID
4. Add comprehensive tests for both middleware components in correlation-id.test.ts and request-logger.test.ts
5. Export both from src/middleware/index.ts