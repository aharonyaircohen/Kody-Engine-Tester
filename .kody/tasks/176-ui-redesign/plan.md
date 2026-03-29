Plan written to `.kody/tasks/176-ui-redesign/plan.md`. Here's the summary:

---

## Plan: Notes Page → Master-Detail Layout

**6 steps, TDD order:**

| Step | File | Action |
|------|------|--------|
| 1 | `NoteListItem.test.tsx` | Write 5 tests (title, first-line, tag dots, click, selected class) |
| 2 | `NoteListItem.tsx` + `.module.css` | Implement list item with colored dots, truncation, date |
| 3 | `NotePreview.test.tsx` | Write 5 tests (placeholder, title, content, tags, edit link) |
| 4 | `NotePreview.tsx` + `.module.css` | Implement preview panel with TagBadge, Edit link, placeholder |
| 5 | `notes/page.tsx` | Replace grid with master-detail, add `selectedId` state, mobile nav |
| 6 | `notes/notes.module.css` | 40/60 split layout, hide preview `<768px` via media query |

**Key decisions baked in:**
- Mobile detection via `window.matchMedia('(max-width: 767px)')` in the click handler — avoids a layout effect or SSR hydration issues
- Tag colors derived deterministically from tag string hash (no random, stable across renders)
- `NoteCard.tsx` is **left untouched** — still used by other parts of the app if any
