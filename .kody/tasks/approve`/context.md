
### taskify (2026-04-18T13:23:09)

{"task_type":"feature","title":"Add capitalize utility to src/utils/strings.ts with tests","description":"Create src/utils/strings.ts with a capitalize function and co-located src/utils/strings.test.ts tests. The function should uppercase the first character of the string (sentence case) and lowercase the remainder, handling edge cases such as empty strings and already-uppercase inputs.","scope":["src/utils/strings.ts","src/utils/strings.test.ts"],"risk_level":"low","existing_patterns":[{"path"
...(truncated)

### build (2026-04-18T13:24:11)
Done. Here's what was implemented:

**`src/utils/strings.ts`** — `capitalize(str)` function that:
- Uppercases the first character (sentence case, not title case)
- Lowercases the remainder
- Returns `''` for empty/falsy input

**`src/utils/strings.test.ts`** — 8 tests covering:
- Basic uppercase/lowercase behavior (`hello` → `Hello`, `WORLD` → `World`)
- Single-character strings
- Empty strings
- `null`/`undefined` falsy inputs
- Already sentence-cased strings
- Mixed-case strings with spaces
-
...(truncated)
