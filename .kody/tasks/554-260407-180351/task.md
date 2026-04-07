# [run-20260407-1802] T02: Add middleware with tests

## Task
Add a `cors-middleware.ts` in `src/middleware/` that handles Cross-Origin Resource Sharing with the following options:
- `origin`: allowed origins array
- `methods`: allowed HTTP methods
- `credentials`: allow credentials flag

Write `cors-middleware.test.ts` with tests for all options.

## Requirements
- Use the same pattern as existing middleware in `src/middleware/`
- Export both the middleware factory and a default config