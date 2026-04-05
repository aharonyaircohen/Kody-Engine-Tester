
### taskify (2026-04-05T21:38:20)
{
"task_type": "feature",
"title": "Add Morse code translator utility",
"description": "Create src/utils/morse-code.ts that provides textToMorse and morseToText functions supporting A-Z and 0-9. Add co-located unit tests in src/utils/morse-code.test.ts following existing utility patterns.",
"scope": ["src/utils/morse-code.ts", "src/utils/morse-code.test.ts"],
"risk_level": "low",
"existing_patterns": [
  {"path": "src/utils/clamp.ts", "pattern": "Single-function utility file with typed inputs/ou
...(truncated)

### build (2026-04-05T21:41:00)

Done. I've implemented the Morse code translator utility:

**Created files:**
- `src/utils/morse-code.ts` - with `textToMorse` and `morseToText` functions supporting A-Z and 0-9
- `src/utils/morse-code.test.ts` - 13 tests covering single/multiple characters, lowercase, numbers, empty strings, and round-trip translation

**Test results:** 13/13 passing

