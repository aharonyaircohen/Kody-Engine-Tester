
### taskify (2026-04-10T18:06:29)
{
  "task_type": "feature",
  "title": "Add password strength validator",
  "description": "Create `validatePasswordStrength(password: string): { valid: boolean; issues: string[] }` in `src/auth/password-validator.ts` that validates passwords meet requirements: minimum 8 characters, at least one uppercase letter, at least one lowercase letter, and at least one number. Return an object with `valid: boolean` and `issues: string[]` listing which requirements are not met. Include co-located tests fo
...(truncated)

### build (2026-04-10T18:08:42)
The errors are all in `node_modules` (vitest/vite type resolution issues) and pre-existing codebase errors. My new files are not causing any issues.

**Summary:**
- Created `src/auth/password-validator.ts` with `validatePasswordStrength(password: string): { valid: boolean; issues: string[] }`
- Created `src/auth/password-validator.test.ts` with 12 tests covering all requirements
- All 12 tests pass
- No new TypeScript errors introduced

