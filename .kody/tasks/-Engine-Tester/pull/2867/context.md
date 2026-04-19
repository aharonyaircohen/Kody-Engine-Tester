
### taskify (2026-04-19T04:49:14)
Now I have full context from the task description and discussion. Let me classify this task.

```json
{
  "task_type": "feature",
  "title": "Add REST API for discussions",
  "description": "Implement a complete REST API surface for discussions under src/app/api/discussions/ using the existing DiscussionsStore from src/collections/Discussions.ts. Four route files are required: GET (list by lesson, newest first), POST (create a post), PATCH (update content/pin/resolve flags), and DELETE (remove a
...(truncated)

### build (2026-04-19T05:01:41)
All tasks complete. Here's a summary of what was implemented:

## Implementation Summary

### Route Files

**`src/app/api/discussions/_utils.ts`** — Shared utilities:
- `serializePost()` — converts `DiscussionPost` dates to ISO strings
- `ok()` / `created()` / `badRequest()` / `notFound()` / `noContent()` — standard API envelope responses
- `isRichTextContent()` — validates `RichTextContent` shape

**`src/app/api/discussions/route.ts`** — `GET` + `POST`:
- `GET` — optional auth; returns posts fo
...(truncated)
