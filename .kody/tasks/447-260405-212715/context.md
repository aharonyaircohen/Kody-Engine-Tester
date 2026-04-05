
### taskify (2026-04-05T21:43:04)
{
  "task_type": "feature",
  "title": "Add hex-color utility with RGB-hex conversion",
  "description": "Create a new utility file src/utils/hex-color.ts with hexToRgb and rgbToHex functions for converting between RGB values and hex color strings, along with co-located tests in src/utils/hex-color.test.ts",
  "scope": [
    "src/utils/hex-color.ts",
    "src/utils/hex-color.test.ts"
  ],
  "risk_level": "low",
  "existing_patterns": [
    {
      "file": "src/utils/color.ts",
      "pattern": "
...(truncated)

### build (2026-04-05T21:44:13)
No lint errors. Implementation complete:

**Created files:**
- `src/utils/hex-color.ts` — exports `RGB` interface, `hexToRgb()`, and `rgbToHex()` functions
- `src/utils/hex-color.test.ts` — 7 tests covering full/short hex, mixed colors, with/without hash prefix, and hex output formatting

**Results:**
- All 7 tests pass
- No lint errors
- TypeScript errors are pre-existing in `tests/helpers/seedUser.ts` (unrelated to this task)

