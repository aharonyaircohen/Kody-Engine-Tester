
### taskify (2026-04-11T16:06:13)
{
  "task_type": "feature",
  "title": "Add UUID v4 generator utility",
  "description": "Create src/utils/uuid.ts with an RFC4122-compliant UUID v4 generator function, and src/utils/uuid.test.ts with tests verifying uniqueness across multiple generations and format validation against the UUID v4 pattern (8-4-4-4-12 hex digits with version 4 variant bits).",
  "scope": [
    "src/utils/uuid.ts",
    "src/utils/uuid.test.ts"
  ],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/slug
...(truncated)

### build (2026-04-11T16:08:26)
Implementation complete. Here's a summary:

**Created files:**

1. **`src/utils/uuid.ts`** - RFC4122-compliant UUID v4 generator:
   - Uses native `crypto.randomUUID()` when available (Node.js 14.17+)
   - Falls back to `crypto.getRandomValues()` with proper version (0x40) and variant (0x80) bits
   - Includes JSDoc explaining the format

2. **`src/utils/uuid.test.ts`** - 10 tests covering:
   - Valid UUID v4 format (regex validation)
   - Correct length (36 chars) and segment structure (8-4-4-4
...(truncated)
