Updated `.kody/steps/review.md` — preserved all existing sections and extended with repository-specific details:

**Repo Patterns** — Added:

- Validation Middleware (`src/middleware/validation.ts`) with `ValidateResult` discriminated union
- Security Sanitizers (`src/security/sanitizers.ts`) — HTML, SQL, URL, path helpers
- URL Parser (`src/utils/url-parser.ts`)

**Improvement Areas** — Added:

- Type narrowing gaps (unsafe `as unknown as` casts in dashboard page)

**Acceptance Criteria** — Added:

- User input sanitization using `src/security/sanitizers.ts`
- Dual auth systems not introduced in new code
- Role enums aligned when new roles are added

{{TASK_CONTEXT}}
