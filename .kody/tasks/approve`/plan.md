

The plan is written to `plan.md`. Here's the summary:

---

## Plan: Implement /api/auth/login and /api/auth/register

**5 steps, TDD-ordered:**

| Step | File | What |
|------|------|------|
| 1 | `src/app/api/auth/login/route.test.ts` | Co-located vitest integration test — valid creds (200), missing fields (400), unknown email (401), wrong password (401), missing hash (401) |
| 2 | `src/app/api/auth/register/route.test.ts` | Co-located vitest integration test — valid registration (201), duplicate email (409), weak password (400), confirmPassword mismatch (400), confirmPassword match (201) |
| 3 | `src/app/api/auth/login/route.ts` | POST handler — mini-Zod schema (`email`, `password`), `validate()` middleware, delegates to `AuthService.login()` |
| 4 | `src/app/api/auth/register/route.ts` | POST handler — mini-Zod schema (`email`, `password`, optional `confirmPassword`), manual strength check, duplicate detection, creates user via Payload then calls `AuthService.login()` |
| 5 | `pnpm test:int -- --run` | Full integration test suite run |

**3 decisions to answer:**

1. **confirmPassword** — *Keep optional (recommended)*. API accepts `{ email, password }` per AC; when `confirmPassword` is present and mismatched, return 400.
2. **Rate limiting** — *No rate limiting (recommended)*. Leave unprotected; add separately as future enhancement.
3. **Validation lib** — *Use mini-Zod (recommended)*. Use `src/utils/schema.ts` throughout; do not add the `zod` npm package.