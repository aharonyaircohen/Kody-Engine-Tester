# [test-suite] Add request compression middleware with tests

Add gzip/brotli request compression middleware in src/middleware/compression.ts. It should compress responses above a configurable size threshold. Include unit tests in src/middleware/compression.test.ts and integration tests for various content types (JSON, HTML, binary).