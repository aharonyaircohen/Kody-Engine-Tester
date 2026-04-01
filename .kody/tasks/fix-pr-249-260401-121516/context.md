
### build (2026-04-01T12:19:07)
**Fix complete.** The change in `src/middleware/request-validator.ts` (lines 232, 240) now uses `JSON.stringify(schema.pattern)` to properly quote pattern strings in error messages, handling dollar signs and other special regex characters correctly.

