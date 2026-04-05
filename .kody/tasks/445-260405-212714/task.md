# [test-suite] Add compression middleware

Create a compression middleware in src/middleware/compression.ts that compresses response bodies using gzip for responses larger than 1KB. Add configuration options for threshold and encoding. Include unit tests in src/middleware/compression.test.ts.