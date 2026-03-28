# Bug: gradebook weighted average calculation ignores zero-weight categories

## Bug Report

The gradebook aggregation service calculates weighted averages but doesn't handle the case where a category has weight=0 (e.g., extra credit that shouldn't count toward the final grade).

**File:** \`src/services/gradebook.ts\`

**Expected:** Categories with weight=0 are excluded from the weighted average denominator
**Actual:** They dilute the average because the total weight includes them, making the denominator larger than intended

**Example:**
- Quiz: weight=40, score=80 → contributes 32
- Assignment: weight=60, score=90 → contributes 54
- Extra credit: weight=0, score=100 → contributes 0
- Current result: (32+54+0) / (40+60+0) = 86% ✓ (works by coincidence when score contributes 0)
- But if extra credit weight=0 and scores=[]: average should still be 86%, not affected by empty array

The real bug: when a zero-weight category has no scores, the service throws a division-by-zero error.

**Fix:** Filter out zero-weight categories before calculating, and handle empty score arrays gracefully.

**Complexity:** low