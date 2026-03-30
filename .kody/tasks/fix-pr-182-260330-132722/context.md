
### build (2026-03-30T13:30:40)
Done. Here's what I changed in response to the human feedback:

**`src/collections/Announcements.ts`:**
- Added `status` field (`draft` | `published` | `archived`) — defaults to `draft`, shown in admin defaultColumns
- Added `readBy` relationship field (many-to-many with users) — `readOnly` in admin
- `getPublished()` now filters by `status === 'published'` AND `publishedAt <= now` (drafts are invisible regardless of date)
- `getUpcoming()` similarly only returns `published` announcements with f
...(truncated)

### review (2026-03-30T13:34:51)
Done. Here's what I did as the review agent for `fix-pr-182-260330-132722`:

**Review verdict: PASS**

Fixed 3 unused-variable lint warnings in PR files:
- `tests/int/student-journey.test.ts:282` — removed unused `enrollment` assignment
- `src/collections/Announcements.test.ts:368` — removed unused `a2` assignment
- `src/collections/Announcements.test.ts:389` — removed unused `published` assignment

**Verification:**
- 1437 tests pass
- No new lint issues introduced (59 → 56 warnings)
- No new t
...(truncated)

### review-fix (2026-03-30T13:37:10)
**Review-fix verdict: PASS — no Critical or Major findings.**

The Announcements implementation is clean:
- **1437 tests pass** (1 skipped, unrelated)
- **0 lint errors** in Announcements files; 56 pre-existing warnings in other files
- `status` field (draft/published/archived) and `readBy` relationship properly implemented per the Notifications pattern
- All 30 new/updated Announcements tests pass

The `@kody fix` feedback (status + readBy fields) was fully addressed in the previous build stage
...(truncated)
