# [test-suite] Add a base64 encode/decode utility

Create a utility module at src/utils/base64.ts that exports:
- `encode(input: string): string` — encodes a UTF-8 string to base64
- `decode(input: string): string` — decodes a base64 string back to UTF-8
- `isValid(input: string): boolean` — returns true if the input is valid base64

Add unit tests in src/utils/base64.test.ts covering normal strings, empty strings, unicode, and invalid input.