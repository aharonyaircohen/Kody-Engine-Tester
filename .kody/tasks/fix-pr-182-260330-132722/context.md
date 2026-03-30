
### build (2026-03-30T13:30:40)
Done. Here's what I changed in response to the human feedback:

**`src/collections/Announcements.ts`:**
- Added `status` field (`draft` | `published` | `archived`) — defaults to `draft`, shown in admin defaultColumns
- Added `readBy` relationship field (many-to-many with users) — `readOnly` in admin
- `getPublished()` now filters by `status === 'published'` AND `publishedAt <= now` (drafts are invisible regardless of date)
- `getUpcoming()` similarly only returns `published` announcements with f
...(truncated)
