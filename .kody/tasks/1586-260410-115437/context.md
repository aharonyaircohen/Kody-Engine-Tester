
### taskify (2026-04-10T11:55:50)
{
"task_type": "feature",
"title": "Add formatPhoneNumber utility function",
"description": "Create a formatPhoneNumber utility in src/utils/formatPhoneNumber.ts that formats US phone numbers as (XXX) XXX-XXXX and international numbers with country code as +1 (XXX) XXX-XXXX. The function should handle inputs with or without existing formatting (e.g., \"1234567890\" or \"123-456-7890\"). Include comprehensive unit tests in src/utils/formatPhoneNumber.test.ts following the existing vitest pattern.
...(truncated)

### build (2026-04-10T11:59:52)
I have successfully implemented the `formatPhoneNumber` utility function. Here's a summary:

**Created files:**
- `src/utils/formatPhoneNumber.ts` - The utility function
- `src/utils/formatPhoneNumber.test.ts` - Unit tests (11 tests)

**Features:**
- Formats 10-digit US numbers as `(123) 456-7890`
- Handles inputs with existing formatting (dashes, spaces, parentheses)
- 11-digit numbers starting with 1 (without `+`) format as domestic `(123) 456-7890`
- Numbers with `+` prefix format as internat
...(truncated)
