Done. Here's what I did as the review agent for `fix-pr-182-260330-132722`:

**Review verdict: PASS**

Fixed 3 unused-variable lint warnings in PR files:
- `tests/int/student-journey.test.ts:282` — removed unused `enrollment` assignment
- `src/collections/Announcements.test.ts:368` — removed unused `a2` assignment
- `src/collections/Announcements.test.ts:389` — removed unused `published` assignment

**Verification:**
- 1437 tests pass
- No new lint issues introduced (59 → 56 warnings)
- No new type errors introduced
- The remaining 56 warnings and 5 type errors are pre-existing in unrelated files

**Changes committed and pushed** to branch `181--add-announcements-collection-for-course-wide-ann` (2 commits):
- `82c76eb` — fix: remove unused variable lint warnings
- `225fa00` — chore: mark task as completed
