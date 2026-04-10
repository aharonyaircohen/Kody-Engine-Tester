
### taskify (2026-04-10T01:30:10)

All 11 tests pass. Created:

- `src/middleware/sanitize.ts` — exports `sanitizeInput(input: string): string` that strips HTML tags, trims whitespace, and normalizes unicode to NFC form
- `src/middleware/sanitize.test.ts` — 11 tests covering HTML stripping, whitespace trimming, unicode normalization, edge cases, and XSS prevention


### build (2026-04-10T01:31:49)
All 11 tests pass. The implementation is complete and verified:

- `src/middleware/sanitize.ts` — exports `sanitizeInput(input: string): string` that strips HTML tags, trims whitespace, and normalizes unicode to NFC form
- `src/middleware/sanitize.test.ts` — 11 tests covering HTML stripping, whitespace trimming, unicode normalization, edge cases, and XSS prevention

