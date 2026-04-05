# Logging Feature
Add structured logging across the application.

## Tasks
1. Add a Logger class in src/utils/structured-logger.ts with log levels (debug, info, warn, error) and JSON output format
2. Add request logging middleware in src/middleware/request-logger-v2.ts that logs method, path, status, and duration using the Logger (depends on Logger class)
3. Add error tracking integration in src/services/error-tracker.ts that captures unhandled errors and sends structured logs (depends on Logger class and request logging middleware)
