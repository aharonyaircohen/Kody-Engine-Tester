
### taskify (2026-04-10T06:29:21)
{
  "task_type": "feature",
  "title": "Add password strength validator",
  "description": "Create `validatePasswordStrength(password: string): { valid: boolean; issues: string[] }` in `src/auth/password-validator.ts` that validates: 8+ characters, at least one uppercase letter, at least one lowercase letter, and at least one number. Return an object with `valid` boolean and `issues` array listing all failed requirements. Include co-located tests.",
  "scope": ["src/auth/password-validator.ts", 
...(truncated)

### build (2026-04-10T06:32:09)
Implementation complete. Created:

- **`src/auth/password-validator.ts`** - Pure function validator with JSDoc, validates 8+ chars, uppercase, lowercase, and number requirements
- **`src/auth/password-validator.test.ts`** - 12 tests covering valid/invalid inputs, edge cases, and boundary conditions

All tests pass and TypeScript type-checks cleanly.

