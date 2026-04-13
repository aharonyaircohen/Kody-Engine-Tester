
### taskify (2026-04-09T18:52:44)
{
  "task_type": "feature",
  "title": "Add input validation to user registration form",
  "description": "Add email format and password strength validation to the registration form at src/pages/auth/register.tsx. The form currently has basic email regex validation and a PasswordStrengthBar visual component, but lacks: (1) a passwordStrength validator in src/validation/validators.ts to prevent weak passwords, (2) proper integration with the useFormValidation hook, (3) server-consistent password 
...(truncated)

### build (2026-04-09T18:59:21)
Implementation complete. Here's what was done:

**1. Added `passwordStrength` validator** (`src/validation/validators.ts:54-62`)
- Validates 8+ characters, uppercase letter, number, and special character
- Error messages match the API requirements in `src/api/auth/register.ts`

**2. Added `confirmPassword` validator** (`src/validation/validators.ts:64-67`)
- Validates that confirmation password matches original password

**3. Updated `register.tsx`** to use `useFormValidation` hook with schema-b
...(truncated)
