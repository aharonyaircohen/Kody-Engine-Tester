
### taskify (2026-04-05T06:03:06)
{"task_type":"feature","title":"Add URL parser utility","description":"Create src/utils/url-parser.ts that extracts protocol, host, path, query params, and fragment from a URL string. Add comprehensive tests in src/utils/url-parser.test.ts following existing vitest patterns.","scope":["src/utils/url-parser.ts","src/utils/url-parser.test.ts"],"risk_level":"low","existing_patterns":["src/utils/url-shortener.ts - similar URL utility with typed interfaces and JSDoc comments","src/utils/debounce.ts -
...(truncated)

### build (2026-04-05T06:08:19)
Implementation complete. Created:

**`src/utils/url-parser.ts`** - URL parser utility with:
- `parseUrl()` - extracts protocol, host, path, query params, fragment
- `isValidUrl()` - validates URL format
- `buildUrl()` - reconstructs URL from parsed components
- Options: `decode` (default: true), `showPort` (default: false)

**`src/utils/url-parser.test.ts`** - 41 tests covering:
- All URL components parsing
- Port handling (standard ports hidden by default)
- URL encoding/decoding
- Non-standard
...(truncated)
