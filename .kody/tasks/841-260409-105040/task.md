# feat: Add session FTS search across past task episodes

## Description
Add full-text search across all past task sessions using an inverted index with BM25 ranking. Every episode (plan, review, nudge, etc.) should be indexed and searchable by keyword.

## Acceptance Criteria
- [ ] All episodes are indexed into the session search layer when created
- [ ] `kody graph search <query>` returns ranked results with BM25 scores
- [ ] Snippets are highlighted with matching terms
- [ ] Search across multiple episodes returns correctly ranked results
- [ ] `.kody/graph/sessions-index.json` contains the FTS index

## Test Verification
After running the pipeline:
```bash
kody graph search . JWT
kody graph search . authentication
```
Expected: ranked results with scores and highlighted snippets.

## Sample Search Terms to Test
- "JWT" / "authentication" — should match auth-related episodes
- "PostgreSQL" / "ORM" — should match database-related episodes  
- "barrel exports" — should match review-style episodes