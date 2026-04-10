
### taskify (2026-04-10T04:05:11)
{
  "task_type": "feature",
  "title": "Add password strength validator",
  "description": "Create `validatePasswordStrength(password: string): { valid: boolean; issues: string[] }` in `src/auth/password-validator.ts` requiring 8+ characters, at least one uppercase letter, at least one lowercase letter, and at least one number. Include co-located tests at `src/auth/password-validator.test.ts`.",
  "scope": ["src/auth/password-validator.ts", "src/auth/password-validator.test.ts"],
  "risk_level":
...(truncated)

### build (2026-04-10T04:06:12)
No type errors in my new files. The one "password" reference is a pre-existing issue in `tests/helpers/seedUser.ts`.

**Summary:**
- Created `src/auth/password-validator.ts` with `validatePasswordStrength(password: string): { valid: boolean; issues: string[] }`
- Created `src/auth/password-validator.test.ts` with 11 tests covering all requirements
- All 11 tests pass

The validator checks for:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one n
...(truncated)
