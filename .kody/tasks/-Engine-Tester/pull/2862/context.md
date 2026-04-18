
### taskify (2026-04-18T21:57:55)
{"path":"task_type","content":"feature","title":"Add format-bytes utility with tests","description":"Create src/utils/format-bytes.ts exporting formatBytes(bytes: number): string with four branching thresholds (B, KB, MB, GB) and co-located src/utils/format-bytes.test.ts covering each branch using vitest.","scope":["src/utils/format-bytes.ts","src/utils/format-bytes.test.ts"],"risk_level":"low","existing_patterns":[{"file":"src/security/csrf-token.test.ts","description":"Vitest test file with de
...(truncated)

### build (2026-04-18T21:59:12)
Both files are implemented and all tests pass. Here's a summary of what was created:

**`src/utils/format-bytes.ts`** — exports `formatBytes(bytes: number): string` with four branching thresholds:
- `< 1024` → `${n}B`
- `< 1 MB` → `${n.toFixed(1)}KB`
- `< 1 GB` → `${n.toFixed(1)}MB`
- `≥ 1 GB` → `${n.toFixed(1)}GB`

**`src/utils/format-bytes.test.ts`** — 4 test cases covering each branch, matching the co-located `*.test.ts` pattern used throughout the codebase. All 4 tests pass with no type erro
...(truncated)
