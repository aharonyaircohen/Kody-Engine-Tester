
### taskify (2026-04-09T14:47:56)
{
  "task_type": "chore",
  "title": "Verify graph memory commit after nudge",
  "description": "Verify that graph memory (episodes and FTS index) is properly committed after nudge runs. Check that ep_nudge_*.json files exist in .kody/graph/episodes/ and that nudge episodes appear in sessions-index.json FTS index.",
  "scope": [
    ".kody/graph/episodes/ep_nudge_001.json",
    ".kody/graph/episodes/ep_nudge_002.json",
    ".kody/graph/sessions-index.json",
    ".kody/graph/episodes/.seq",
    "
...(truncated)

### build (2026-04-09T14:49:01)
**Verification Summary:**

Graph memory is properly committed after nudge. All checks pass:

| Check | Status |
|-------|--------|
| `ep_nudge_001.json` exists | ✅ |
| `ep_nudge_002.json` exists | ✅ |
| `ep_nudge_001` in FTS index | ✅ |
| `ep_nudge_002` in FTS index | ✅ |
| `.seq` tracks `nudge: 2` | ✅ |

The FTS index entries contain proper metadata:
- `taskId`: References the originating task
- `source`: "nudge" 
- `content`: "LLM nudge identified 3 pattern(s)"
- `createdAt`: Timestamps match 
...(truncated)
