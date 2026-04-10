
### taskify (2026-04-10T00:00:55)
{
"task_type": "feature",
"title": "Add levenshtein distance utility",
"description": "Implement Levenshtein distance algorithm in `src/utils/levenshtein.ts` with two exported functions: `levenshteinDistance(a: string, b: string): number` for calculating minimum edit distance (insertions, deletions, substitutions), and `levenshteinSimilarity(a: string, b: string): number` returning a normalized 0-1 similarity score.",
"scope": ["src/utils/levenshtein.ts", "src/utils/levenshtein.test.ts"],
"risk_
...(truncated)

### build (2026-04-10T00:02:32)
Implementation complete. Here's a summary:

**Created files:**
- `src/utils/levenshtein.ts` - Implements `levenshteinDistance` (DP matrix approach, O(mn)) and `levenshteinSimilarity` (normalized 0-1 score)
- `src/utils/levenshtein.test.ts` - 9 tests covering edge cases and acceptance criteria

**Test results:** All 9 tests pass

**Acceptance criteria verified:**
- `levenshteinDistance` correctly computes edit distance
- `levenshteinSimilarity` returns values between 0 and 1
- Basic test cases pa
...(truncated)
