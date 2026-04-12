
### build (2026-04-12T13:17:17)
The fix is complete. Here's a summary:

**Issue**: The `queryBuilder.ts` function had a misleading comment that said "Dollar signs ($) are preserved as-is" when in fact the implementation uses `encodeURIComponent()` which correctly encodes `$` to `%24`.

**Fix**: Updated the comment to accurately describe the behavior: "Dollar signs ($) are encoded via encodeURIComponent (e.g. $ becomes %24)"

**Verification**:
- 15 queryBuilder tests pass
- The implementation correctly encodes special character
...(truncated)
