
### build (2026-04-01T10:45:46)
All 51 request-validator tests pass. The fix addresses the ReDoS vulnerability by implementing:

1. **Pattern length limit** (500 chars max) - prevents memory exhaustion
2. **Regex caching** (LRU-style, 100 entries) - prevents recompilation and memory bloat  
3. **Node 20+ timeout option** (100ms) - prevents CPU exhaustion via catastrophic backtracking

The implementation at `src/middleware/request-validator.ts:16-58` includes:
- `createSafeRegex()` function that validates pattern length, checks
...(truncated)
