# Add note count badge next to the Notes heading

## Description

Add a count badge next to the "Notes" heading on the notes list page (`/notes`) that shows the total number of notes.

## Requirements

1. Add a badge/pill element next to the "Notes" h1 heading showing the count (e.g., "Notes (3)")
2. Style: small gray rounded pill with the number, e.g. `background: #333; color: #aaa; padding: 2px 10px; border-radius: 12px; font-size: 0.8rem`
3. When there are 0 notes, show "0"
4. The count should update when search filters results (show filtered count)
5. Add a unit test for the badge

## Acceptance Criteria

- [ ] Badge shows next to heading with correct count
- [ ] Count updates when search filters results
- [ ] Visual verification: start dev server and browse to /notes to confirm the badge renders correctly
- [ ] Unit test passes