# [run-20260409-2355] T01: Simple levenshtein distance utility

## Task
Add a Levenshtein distance algorithm implementation in `src/utils/levenshtein.ts`.

The function should:
- Calculate the minimum edit distance between two strings
- Support insertion, deletion, and substitution operations
- Export a `levenshteinDistance(a: string, b: string): number` function
- Export a `levenshteinSimilarity(a: string, b: string): number` function that returns a 0-1 score

## Context
This is a basic string similarity metric used in fuzzy matching, spell checking, and DNA sequence analysis.

## Acceptance Criteria
- [ ] `levenshteinDistance` correctly computes edit distance
- [ ] `levenshteinSimilarity` returns values between 0 and 1
- [ ] Basic test cases pass


---

## Discussion (2 comments)

**@aharonyaircohen** (2026-04-09):
@kody

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `1156-260409-235720` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24219246869))

To rerun: `@kody rerun 1156-260409-235720 --from <stage>`

