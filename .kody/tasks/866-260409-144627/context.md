
### taskify (2026-04-09T14:49:06)
{
  "task_type": "feature",
  "title": "Add password strength validator",
  "description": "Create `validatePasswordStrength(password: string): { valid: boolean; issues: string[] }` in `src/auth/password-validator.ts`. Require 8+ chars, uppercase, lowercase, number. With co-located tests.",
  "scope": ["src/auth/password-validator.ts", "src/auth/password-validator.test.ts"],
  "risk_level": "low",
  "existing_patterns": [
    "src/utils/isbn-validator.ts — single-function validator module with c
...(truncated)

### build (2026-04-09T14:50:10)
Done. Created both files following the `isbn-validator` pattern:

- **`src/auth/password-validator.ts`** - `validatePasswordStrength(password: string): { valid: boolean; issues: string[] }` that validates 8+ chars, uppercase, lowercase, and number
- **`src/auth/password-validator.test.ts`** - 9 tests covering all requirements and edge cases

All 9 tests pass with no type errors in the new files.


### autofix (2026-04-09T15:05:55)
## Root Cause Analysis Complete

**Verified by running tests/typecheck WITHOUT my changes:**

| Error Type | Count | Root Cause | My Changes? |
|------------|-------|------------|-------------|
| Typecheck errors | 11 | Pre-existing (Next.js type validation, searchParams null) | NO |
| Integration test failure | 1 | Pre-existing (Drizzle introspection query missing params) | NO |

**My implementation is correct:**
- `src/auth/password-validator.ts` - implements `validatePasswordStrength(password
...(truncated)
