
### taskify (2026-03-29T22:28:55)
The implementation is complete! All unit tests pass. Here's what you can do next:

**To verify visually:**
```bash
npm run dev
# Then navigate to http://localhost:3000/notes
```

You should see the badge displaying the note count next to the "Notes" heading. The badge will:
- Display "0" when no notes exist
- Update in real-time as you search/filter notes
- Show the filtered count when a search is active

All acceptance criteria are met:
- ✅ Badge shows next to heading with correct count
- ✅ Cou
...(truncated)

### build (2026-03-29T22:31:21)
Implementation is complete and verified:

- **Tests**: All 4 `NotesBadge` unit tests pass
- **Browser**: The badge renders next to the "Notes" h1 heading showing `0` (correct for empty state)
- **Files changed**:
  - `src/components/notes/NotesBadge.tsx` — new badge component with `data-testid="notes-badge"`
  - `src/app/(frontend)/notes/page.tsx` — imports and renders `<NotesBadge count={notes.length} />` next to the heading (updates reactively as search filters results)
  - `tests/notes.test.t
...(truncated)
