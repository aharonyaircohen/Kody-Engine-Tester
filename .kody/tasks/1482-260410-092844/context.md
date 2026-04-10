
### taskify (2026-04-10T09:32:21)
{
  "task_type": "feature",
  "title": "Add password strength validator",
  "description": "Create `validatePasswordStrength(password: string): { valid: boolean; issues: string[] }` in `src/auth/password-validator.ts` that validates: 8+ characters, at least one uppercase letter, at least one lowercase letter, and at least one number. Include comprehensive tests in `src/auth/password-validator.test.ts`.",
  "scope": [
    "src/auth/password-validator.ts",
    "src/auth/password-validator.test.ts"
...(truncated)

### build (2026-04-10T09:36:17)
Implementation complete. Created:

- **`src/auth/password-validator.ts`** - `validatePasswordStrength(password: string): { valid: boolean; issues: string[] }` that validates:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

- **`src/auth/password-validator.test.ts`** - 12 tests covering valid passwords, missing requirements, multiple issues, and edge cases (null/undefined/non-string input)

All tests pass.

