
### taskify (2026-03-30T13:16:10)
Done! I've created the Announcements collection with the following implementation:

**Files created:**
- `src/collections/Announcements.ts` - Collection with Payload CMS config and AnnouncementsStore class
- `src/collections/Announcements.test.ts` - Comprehensive test suite

**Files modified:**
- `src/payload.config.ts` - Added Announcements to collections array

**Collection fields:**
- `title` (text, required)
- `body` (textarea, required)
- `course` (relationship to Courses, required)
- `prio
...(truncated)

### build (2026-03-30T13:16:46)
All 17 Announcements tests pass. The TypeScript errors shown are pre-existing issues in unrelated files (Assignments.ts, auth-context.test.tsx, event-emitter.ts, pipe.test.ts) — not introduced by the Announcements collection.

**Summary of what's implemented:**

- **`src/collections/Announcements.ts`** — `Announcements` CollectionConfig with all required fields:
  - `title` (text, required)
  - `body` (textarea, required)
  - `course` (relationship to Courses, required)
  - `priority` (select: l
...(truncated)
