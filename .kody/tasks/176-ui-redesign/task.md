# Redesign Notes page from grid layout to list view with sidebar preview

## Description

The Notes page currently displays notes in a card grid layout. Redesign it to use a **master-detail layout**: a scrollable list on the left and a preview panel on the right.

## Requirements

### List Panel (left side, ~40% width)
1. Each note in the list shows:
   - Title (bold, truncated to 1 line)
   - First line of content (gray, truncated to 1 line)
   - Date (small, bottom-right)
   - Tags as small colored dots (not full badges)
2. The currently selected note should have a highlighted background (#2a2a4a)
3. Clicking a note selects it (shows in preview) — does NOT navigate away

### Preview Panel (right side, ~60% width)
1. Shows the full content of the selected note
2. Displays: title, all tags as full badges, full content, date, and an "Edit" link to `/notes/edit/{id}`
3. When no note is selected, show a placeholder: "Select a note to preview"

### Responsive Behavior
1. On screens < 768px, show ONLY the list (no preview panel)
2. Clicking a note on mobile navigates to `/notes/{id}` (existing detail page)

### Existing Behavior to Preserve
- Search bar still works and filters the list
- "New Note" button remains in the header
- The page header ("Notes" title) stays the same

## Acceptance Criteria

- [ ] Master-detail layout renders correctly on desktop (> 768px)
- [ ] List-only layout renders correctly on mobile (< 768px)
- [ ] Note selection updates the preview panel
- [ ] Search filtering works in the list
- [ ] Unit tests for the new list item and preview components
- [ ] **Use browser tools to visually verify the layout at both desktop and mobile widths**

## Technical Notes

- Current page: `src/app/(frontend)/notes/page.tsx`
- Current card component: `src/components/notes/NoteCard.tsx` — will need a new `NoteListItem.tsx`
- New component: `src/components/notes/NotePreview.tsx`
- Use CSS modules for styling
- Keep it client-side (`'use client'`)