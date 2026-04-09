
### build (2026-04-09T20:59:30)

The fix is complete. Here's a summary of the changes made:

## Summary

**File modified:** `src/utils/queryBuilder.ts`

**Changes:**
1. **Fixed JSDoc comment** (line 6): Changed "Dollar signs ($) are preserved as-is" to "Dollar signs ($) are encoded as %24"

2. **Added dollar sign encoding** (lines 27, 36): Added `.replace('$', '%24')` after `encodeURIComponent()` to properly encode dollar signs as `%24` for:
   - Array item values
   - Scalar string values

**Verification:**
- All 15 queryBuil
...(truncated)
