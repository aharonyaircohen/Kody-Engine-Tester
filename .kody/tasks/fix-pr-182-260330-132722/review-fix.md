**Review-fix verdict: PASS — no Critical or Major findings**

The Announcements implementation was reviewed against the codebase patterns. No Critical or Major issues were found:

- `status` field (draft/published/archived) added following the Notifications collection pattern ✓
- `readBy` relationship field added (many-to-many with users, readOnly in admin) ✓
- `getPublished()` correctly filters by `status === 'published'` AND `publishedAt <= now` ✓
- `markAsRead()`, `getUnreadForUser()`, `getReadBy()` store methods implemented ✓
- All 30 Announcements tests pass ✓
- Announcements files: 0 lint errors, 0 lint warnings ✓
- No new lint issues introduced (56 pre-existing warnings in unrelated files) ✓
- All 1437 tests pass ✓
