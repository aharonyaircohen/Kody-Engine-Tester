# Plan: Verify Auth Middleware Covers All Existing Routes

## Context
This is a **verification task** — no code changes expected unless gaps are found.
The goal is to audit and confirm that authentication protection is complete across the API and frontend layers.

---

## Phase 1: API Route Audit

**All 15 API routes in `src/app/api/`**

### Public (intentionally unprotected) ✅
| Route | Handler | Status |
|-------|---------|--------|
| `GET /api/health` | `src/app/api/health/route.ts` | No auth — correct (health check) |
| `GET /api/csrf-token` | `src/app/api/csrf-token/route.ts` | No auth — correct (requires `x-session-id` header) |

### Protected (with `withAuth`) ✅ — All 13 routes verified

| Route | Handler | withAuth | Role Restriction |
|-------|---------|----------|-----------------|
| `GET /api/quizzes/[id]` | `quizzes/[id]/route.ts` | ✅ `{ optional: true }` | None (quiz preview) |
| `POST /api/quizzes/[id]/submit` | `quizzes/[id]/submit/route.ts` | ✅ | None (all auth users) |
| `GET /api/quizzes/[id]/attempts` | `quizzes/[id]/attempts/route.ts` | ✅ | None |
| `GET /api/courses/search` | `courses/search/route.ts` | ✅ `{ optional: true }` | None |
| `POST /api/enroll` | `enroll/route.ts` | ✅ `{ roles: ['viewer','admin'] }` | ✅ viewer/admin |
| `GET /api/notes` | `notes/route.ts` | ✅ `{ optional: true }` | None |
| `POST /api/notes` | `notes/route.ts` | ✅ `{ roles: ['admin','editor'] }` | ✅ admin/editor |
| `GET /api/notes/[id]` | `notes/[id]/route.ts` | ✅ `{ optional: true }` | None |
| `PUT /api/notes/[id]` | `notes/[id]/route.ts` | ✅ `{ roles: ['admin','editor'] }` | ✅ admin/editor |
| `DELETE /api/notes/[id]` | `notes/[id]/route.ts` | ✅ `{ roles: ['admin'] }` | ✅ admin |
| `GET /api/notifications` | `notifications/route.ts` | ✅ | None |
| `PATCH /api/notifications/[id]/read` | `notifications/[id]/read/route.ts` | ✅ | None |
| `POST /api/notifications/read-all` | `notifications/read-all/route.ts` | ✅ | None |
| `GET /api/gradebook` | `gradebook/route.ts` | ✅ `{ roles: ['viewer','admin','editor'] }` | ✅ |
| `GET /api/gradebook/course/[id]` | `gradebook/course/[id]/route.ts` | ✅ `{ roles: ['editor','admin'] }` | ✅ |
| `GET /api/dashboard/admin-stats` | `dashboard/admin-stats/route.ts` | ✅ `{ roles: ['admin'] }` | ✅ |

**API verdict:** All 13 protected routes correctly use `withAuth`. 2 intentionally public routes are correctly unprotected. ✅

---

## Phase 2: Frontend Page Audit

**All 6 pages in `src/app/(frontend)/`**

| Page | Component Type | Auth Check | Role Enforcement | Status |
|------|---------------|------------|-----------------|--------|
| `page.tsx` (home) | Server | ✅ `payload.auth()` | None (landing, intentional) | ✅ Acceptable |
| `dashboard/page.tsx` | Server | ✅ `payload.auth()` + `redirect('/admin/login')` | ✅ Redirects non-students to `/` | ✅ Complete |
| `notes/page.tsx` | Client | ⚠️ No auth redirect | None | ⚠️ Gap |
| `notes/[id]/page.tsx` | Client | ⚠️ No auth redirect | None | ⚠️ Gap |
| `notes/create/page.tsx` | Client | ⚠️ No auth redirect | None | ⚠️ Gap |
| `notes/edit/[id]/page.tsx` | Client | ⚠️ No auth redirect | None | ⚠️ Gap |
| `instructor/courses/[id]/edit/page.tsx` | Client | ⚠️ No auth redirect | None | ⚠️ Gap |

### Gap Details

**Gap 1: All 4 notes pages lack auth redirect UX**
- `notes/page.tsx`, `notes/[id]/page.tsx`, `notes/create/page.tsx`, `notes/edit/[id]/page.tsx`
- The `NotesStore` fetches from protected API routes, but unauthenticated users land on these pages with no redirect
- The API will return 401 — the client-side `notesStore` methods throw generic errors with no user-facing message
- **Fix:** Add a `payload.auth()` check (server-side via a route-level auth guard or client-side) that redirects to `/admin/login`

**Gap 2: Instructor course editor lacks auth redirect**
- `instructor/courses/[id]/edit/page.tsx`
- Any user can navigate to this page; the `moduleStore`/`lessonStore` are in-memory so the data won't load for unauthenticated users, but no redirect occurs
- **Fix:** Add auth redirect similar to dashboard

---

## Phase 3: Verification Execution Steps

1. Run `pnpm tsc --noEmit` — confirm no type errors (baseline)
2. Run `pnpm test:int` — confirm all integration tests pass (baseline)
3. Audit each API route file for `withAuth` usage (manual + grep confirmation)
4. Audit each frontend page for `payload.auth()` + `redirect()` pattern

---

## Verification Result

### API Routes — ✅ ALL PROTECTED
- 13 protected routes all use `withAuth` correctly
- 2 public routes (`/health`, `/csrf-token`) are intentionally unprotected
- Role restrictions match intended access control

### Frontend Pages — ⚠️ 2 GAPS FOUND
- `dashboard/page.tsx` — fully protected ✅
- `page.tsx` (landing) — has auth check, no role required ✅ (acceptable for public landing)
- 4 notes pages (`notes/page.tsx`, `notes/[id]/page.tsx`, `notes/create/page.tsx`, `notes/edit/[id]/page.tsx`) — no auth redirect ⚠️
- `instructor/courses/[id]/edit/page.tsx` — no auth redirect ⚠️

---

## Required Fixes (if any)

This is listed as "no code changes expected" — however, 2 clear gaps exist in frontend auth UX. If remediation is desired:
- Add `payload.auth()` check + `redirect('/admin/login')` to 4 notes pages (they are client components, so add a server-side wrapper or `useEffect` auth guard)
- Add `payload.auth()` check + `redirect('/admin/login')` to instructor course editor page
