# [run-20260410-1148] T02: Add middleware with tests

## Task
Add a `cacheControl` middleware in src/middleware/ that sets cache-related HTTP headers.

## Requirements
- Sets Cache-Control header with options: no-store, no-cache, max-age, private
- Adds Last-Modified and ETag headers based on content hash
- Handles conditional requests (If-None-Match, If-Modified-Since)
- Returns 304 Not Modified when appropriate
- Include comprehensive unit tests in src/middleware/cacheControl.test.ts
- Export middleware and types

## Context
The API needs cache control headers to reduce unnecessary network traffic and improve performance.


---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody full

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1587-260410-114952` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24241457834))

To rerun: `@kody rerun 1587-260410-114952 --from <stage>`

