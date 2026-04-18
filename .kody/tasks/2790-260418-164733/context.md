
### taskify (2026-04-18T16:50:22)
{"task_type":"chore","title":"Add integration tests for auth-protected API routes","description":"All routes specified in the acceptance criteria (/api/notes, /api/enroll, /api/gradebook/*) already use the withAuth HOC which extracts Bearer tokens and returns 401 for missing/invalid/expired tokens. The remaining work is adding integration tests in tests/int/ verifying: (1) calling a protected endpoint without a token returns 401, (2) calling with a valid token returns 200, (3) calling with an ex
...(truncated)

### build (2026-04-18T17:03:52)
All 13 integration tests pass. Here's a summary of what was implemented:

---

## What was done

### New file: `tests/int/auth-protected-routes.int.spec.ts`

13 integration tests covering all acceptance criteria, organized into 5 test groups:

**`withAuth — missing or invalid token returns 401`** (3 tests)
- `POST /api/notes` → 401, `POST /api/enroll` → 401, `GET /api/gradebook/course/:id` → 401

**`withAuth — malformed or unrecognized token returns 401`** (4 tests)
- Invalid JWT string → 401
- 
...(truncated)
