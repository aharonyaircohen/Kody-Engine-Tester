
### taskify (2026-04-05T21:38:13)
{
"task_type": "feature",
"title": "Add Roman numeral converter utility",
"description": "Create src/utils/roman-numeral.ts with functions to convert integers to Roman numerals and vice versa, supporting the range 1-3999. Add unit tests in roman-numeral.test.ts following the existing test patterns (describe/it/expect).",
"scope": ["src/utils/roman-numeral.ts", "src/utils/roman-numeral.test.ts"],
"risk_level": "low",
"existing_patterns": [
{"path": "src/utils/clamp.ts", "description": "Single-fun
...(truncated)

### build (2026-04-05T21:43:12)
The Roman numeral converter utility is complete. Here's a summary:

**Created files:**
- `src/utils/roman-numeral.ts` - Contains `toRoman(num)` and `fromRoman(roman)` functions supporting range 1-3999
- `src/utils/roman-numeral.test.ts` - 39 unit tests covering:
  - Basic numeral conversions (I, IV, V, IX, X, XL, L, XC, C, CD, D, CM, M)
  - Complex numbers (1994 → MCMXCIV, 2024 → MMXXIV, 3999 → MMMCMXCIX)
  - Lowercase input handling
  - Error cases (empty string, invalid characters, out-of-rang
...(truncated)
