Updated `.kody/steps/autofix.md` with repo-specific content for the three sections:

**## Repo Patterns** — Added specific code examples:

- `Result<T, E>` type classes with `.match()`, `.map()`, `.andThen()` from `src/utils/result.ts`
- `createRequestLogger()` factory from `src/middleware/request-logger.ts`
- `ContactStore` class with exact method signatures from `src/collections/contacts.ts`
- `withAuth()` signature from `src/auth/withAuth.ts`
- Payload query pattern with `depth: 1` from `dashboard/page.tsx:52-57`
- Security sanitizers (`sanitizeHtml`, `sanitizeSql`, `sanitizeUrl`) from `src/security/sanitizers.ts`

**## Improvement Areas** — Added specific anti-patterns with file:line references:

- Type assertion abuse at lines 44, 60, 72, 113, 125, 143, 158 in `dashboard/page.tsx`
- Dual auth systems: SHA-256 in `user-store.ts:53-58` vs PBKDF2 in `auth-service.ts:45-59`
- Role divergence: `UserRole` vs `RbacRole` with exact enum values
- Validation middleware re-runs `validate()` 3x at lines 246-262
- In-memory `SessionStore` limitation

**## Acceptance Criteria** — Added 14 specific checkboxes including:

- Commands: `pnpm lint --fix`, `pnpm tsc --noEmit`
- Auth rules: use `AuthService` (PBKDF2/JWT), not `UserStore` (SHA-256)
- No direct crypto in route handlers
- Payload depth requirements
- Sanitization requirements
- ESLint-disable policy

{{TASK_CONTEXT}}
