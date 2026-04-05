# [test-suite] Add request validation middleware with schema support

Create a request validation middleware at src/middleware/validation.ts that:
- Accepts a Zod-like schema object for body, query, and params
- Returns 400 with structured error messages on validation failure
- Passes validated data to next handler via req.validated
- Supports optional fields and default values

Add unit tests in src/middleware/validation.test.ts covering:
- Valid request passes through
- Invalid body returns 400 with field-level errors
- Missing required fields detected
- Optional fields with defaults applied