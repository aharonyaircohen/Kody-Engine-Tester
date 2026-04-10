# [run-20260410-1307] T01: Simple utility function

## Task
Add a URL-safe base64 encoding utility in `src/utils/base64url.ts` that provides `encode` and `decode` functions for URL-safe base64 encoding (replacing '+' with '-' and '/' with '_', and removing '=' padding).

## Context
Standard base64 encoding uses characters that are not safe in URLs ('+', '/', '='). This utility should wrap a library to provide URL-safe encoding/decoding.

## Acceptance Criteria
- `encode(input: string): string` — encodes a string to URL-safe base64
- `decode(input: string): string` — decodes a URL-safe base64 string back to plaintext
- Both functions handle Unicode correctly (use TextEncoder)
- Unit tests in `src/utils/base64url.test.ts`

---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-10):
@kody

**@aharonyaircohen** (2026-04-10):
🚀 Kody pipeline started: `1656-260410-130946` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24244509769))

To rerun: `@kody rerun 1656-260410-130946 --from <stage>`

