# Bug: Notes page header and search bar overlap on narrow viewports

## Bug Description

On the Notes list page (`/notes`), the header row (title + "New Note" button) and the search bar below it have layout problems on narrow viewports (< 600px):

1. The "Notes" heading and "New Note" button are in a horizontal flex row that doesn't wrap — on small screens the button gets cut off or overflows
2. There is no visual separation between the header area and the search bar — they blend together
3. The page has no navigation back to the home page

## Expected Behavior

1. On narrow viewports (< 600px), the header should stack vertically: title on top, button below, both full-width
2. Add a subtle bottom border or separator between the header section and the search bar
3. Add a "← Back" link at the top of the page that navigates to `/`

## Steps to Reproduce

1. Navigate to `/notes`
2. Resize the browser window to < 600px width
3. Observe the layout issues

## Acceptance Criteria

- [ ] Header wraps to vertical layout on narrow screens (< 600px)
- [ ] Visual separator between header and search
- [ ] Back navigation link added
- [ ] Existing NoteCard grid layout still works correctly
- [ ] Unit tests for any new components
- [ ] **Visually verify the page renders correctly at both wide and narrow viewports using the browser**

## Technical Notes

- The Notes page is at `src/app/(frontend)/notes/page.tsx`
- Styles are currently inline — consider extracting to a CSS module
- The page uses client-side rendering (`'use client'`)