
### taskify (2026-04-10T15:18:32)
{
  "task_type": "feature",
  "title": "Add password strength validator",
  "description": "Create `validatePasswordStrength(password: string): { valid: boolean; issues: string[] }` in `src/auth/password-validator.ts`. Require minimum 8 characters, at least one uppercase letter, at least one lowercase letter, and at least one number. Include comprehensive tests in `src/auth/password-validator.test.ts`.",
  "scope": ["src/auth/password-validator.ts", "src/auth/password-validator.test.ts"],
  "ris
...(truncated)

### build (2026-04-10T15:20:44)
**Implementation complete.** I created:

1. **`src/auth/password-validator.ts`** - Password strength validator with:
   - `validatePasswordStrength(password: string): { valid: boolean; issues: string[] }`
   - Requirements: 8+ chars, uppercase, lowercase, number
   - Input validation for null/undefined/non-string

2. **`src/auth/password-validator.test.ts`** - 15 comprehensive tests covering:
   - Valid passwords meeting all requirements
   - Each individual validation failure
   - Multiple fail
...(truncated)
