
### taskify (2026-04-09T08:40:00)
Based on my exploration, I can now classify this task:

**Key findings:**
- `src/utils/test-fts.ts` does not exist yet - needs to be created
- The FTS layer exists at `.kody/graph/sessions-index.json` with indexed vocabulary and documents
- Episodes are stored in `.kody/graph/episodes/` with sources: `migration`, `plan`, `nudge`, `review`
- The `.seq` file tracks episode counts by source - currently NO `retrospective` entries
- The pipeline stages are: taskify → plan → build → verify → review → 
...(truncated)

### build (2026-04-09T08:52:39)
I have successfully created the FTS search indexing test utility. Here's a summary of what was implemented:

## Created Files

### `src/utils/test-fts.ts`
Main utility with functions for:
- `loadFtsIndex()` - Loads FTS index from `sessions-index.json`
- `loadEpisodes()` - Loads all episodes from the episodes directory
- `loadSeq()` - Loads sequence tracking file (`.seq`)
- `searchFts(query, limit)` - Searches FTS index with IDF-weighted ranking
- `getEpisodesBySource(source)` - Filters episodes 
...(truncated)
