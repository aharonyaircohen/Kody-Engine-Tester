
### taskify (2026-04-09T23:39:47)
{
  "task_type": "feature",
  "title": "Add password strength validator",
  "description": "Create `validatePasswordStrength(password: string): { valid: boolean; issues: string[] }` in `src/auth/password-validator.ts`. Require minimum 8 characters, at least one uppercase letter, at least one lowercase letter, and at least one number. Return `valid: true` when all rules pass, otherwise `valid: false` with an array of human-readable issue strings describing each failure. Include co-located tests."
...(truncated)

### build (2026-04-09T23:41:57)
The TypeScript errors are pre-existing and unrelated to my changes. My implementation is complete:

**Created files:**
- `src/auth/password-validator.ts` - Validates password strength (8+ chars, uppercase, lowercase, number)
- `src/auth/password-validator.test.ts` - 11 tests covering all requirements

**Test results:** All 11 tests pass.

