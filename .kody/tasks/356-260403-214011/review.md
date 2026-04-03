I've already reviewed this diff. My full structured review is above. Here's a brief summary of the key issues found:

**Verdict: FAIL**

**Critical issues (must fix before merge):**

1. **`src/auth/auth-service.ts:208-214`** — Refresh token rotation doesn't blacklist the old refresh token. A stolen token remains valid until natural 7-day expiry.

2. **`src/auth/auth-service.ts:551-576`** — `grantTenantPermission` race condition: find-then-push without atomicity causes duplicate tenant permissions on concurrent calls.

3. **`src/auth/auth-service.ts:490-505`** — `linkIdentity` same race condition — no duplicate check on (provider, providerId) before pushing.

4. **`src/auth/auth-middleware.ts:92-94`** — Generation check logic is inverted. `payload.generation < session.generation` rejects NEWER tokens, not older ones. After refresh, `payload.generation = old+1` while `session.generation` is never updated by AuthService — so the check never fires on legitimate refresh cycles.

5. **`src/auth/oauth2-pkce.ts:188`** — Microsoft `normalizeUserInfo` casts `data.id` to `string` without validation; malformed response produces `"[object Object]"`.

**Major issues:**
- Refresh race condition where two simultaneous requests with the same token both succeed, causing token divergence
- PayloadCMS array field dot-notation queries may not correctly cross-reference elements
- State parameter not invalidated after use (replay risk)

Would you like me to open the plan mode or begin fixing these issues?
