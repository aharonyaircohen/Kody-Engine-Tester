
### build (2026-04-01T22:25:44)
The implementation is complete. Let me provide a summary:

## Implementation Summary

### Files Created

1. **`src/middleware/request-logger.ts`** - The request-logger middleware with:
   - `createRequestLogger(config)` factory function
   - Log levels: `debug`, `info`, `warn`, `error`
   - Output formats: `json`, `text`
   - Configurable exclude paths (defaults to `/health`, `/favicon.ico`)
   - Custom logger injection support
   - Automatic log level based on status code (500+ → error, 400+ → 
...(truncated)
