# feat: test FTS search indexing via retrospective episodes

## Description
Verify that the retrospective stage creates graph episodes after pipeline completion, which are then indexed into the session FTS layer. Run a simple task and verify episodes are created.

## Scope
- src/utils/test-fts.ts

## Test
After running this pipeline, verify:
```bash
ls .kody/graph/episodes/     # should have new retrospective episodes
kody graph search . FTS     # should return ranked results
kody graph search . retrospective
```