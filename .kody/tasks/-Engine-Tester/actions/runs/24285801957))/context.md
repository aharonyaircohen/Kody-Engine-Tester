
### taskify (2026-04-11T15:45:27)
All 8 tests pass. Here's the classification:

```json
{
  "task_type": "feature",
  "title": "Add truncateOnce utility function",
  "description": "Create a truncateOnce utility function that truncates strings longer than maxLength to maxLength-3 characters + '...', returns unchanged strings <= maxLength, returns '...' when maxLength < 3, and never re-truncates an already-truncated string (detected by trailing '...'). Tests cover all acceptance criteria including edge cases for empty strings, wh
...(truncated)

### build (2026-04-11T15:46:55)
The `truncateOnce` implementation is complete and all 8 tests pass.

**Summary:**
- `src/utils/truncate-once.ts` — Implementation with correct truncation logic
- `src/utils/truncate-once.test.ts` — 8 tests covering all acceptance criteria

The implementation correctly:
- Truncates strings longer than `maxLength` to `maxLength - 3` characters + `'...'`
- Returns unchanged strings that are `<= maxLength`
- Returns `'...'` for any string when `maxLength < 3`
- Is idempotent on already-truncated str
...(truncated)
