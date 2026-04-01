# [test-suite] Add request validation middleware with schema support

Create a request validation middleware in src/middleware/request-validator.ts that:
1. Accepts a JSON schema definition for body, query params, and path params
2. Validates incoming requests against the schema
3. Returns 400 with structured error messages for validation failures
4. Supports custom error formatters
5. Add comprehensive tests in request-validator.test.ts
6. Export from a middleware barrel file