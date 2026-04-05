
### taskify (2026-04-05T21:28:38)
{
  "task_type": "feature",
  "title": "Add ISBN validator utility",
  "description": "Create a new utility function in src/utils/isbn-validator.ts that validates ISBN-10 and ISBN-13 formats with check digit validation. Add comprehensive unit tests in src/utils/isbn-validator.test.ts.",
  "scope": ["src/utils/isbn-validator.ts", "src/utils/isbn-validator.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/slugify.ts - Single-function utility with JSDoc documentation",
    "
...(truncated)

### build (2026-04-05T21:30:36)
Implementation complete. Created two files:

**`src/utils/isbn-validator.ts`** - ISBN validator with:
- `isValidIsbn10(isbn)` - validates ISBN-10 (10 digits, last can be X)
- `isValidIsbn13(isbn)` - validates ISBN-13 (13 digits only)  
- `isValidIsbn(isbn)` - auto-detects format and validates

**`src/utils/isbn-validator.test.ts`** - 21 unit tests covering:
- Valid/invalid ISBN-10 with check digit validation
- Valid/invalid ISBN-13 with check digit validation
- X as check digit for ISBN-10
- Whi
...(truncated)
