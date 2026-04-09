
### taskify (2026-04-09T14:55:14)

{"task_type":"chore","title":"Verify graph commit at end of pipeline","description":"Verify that graph memory files (nodes.json, episodes, session-index) are properly committed to git at the end of the pipeline. Check that all graph artifacts exist and the FTS index is updated.","scope":[".kody/graph/nodes.json",".kody/graph/sessions-index.json",".kody/graph/episodes/.seq"],"risk_level":"low","existing_patterns":[".kody/tasks/863-260409-174540/context.md - Graph memory verification pattern chec
...(truncated)

### build (2026-04-09T14:56:00)
**Verification Complete:**

**✅ Scope Items (Properly Committed):**
- `.kody/graph/nodes.json` — Tracked, no uncommitted changes
- `.kody/graph/sessions-index.json` — Tracked, no uncommitted changes  
- `.kody/graph/episodes/.seq` — Tracked, sequence is `{"migration":1,"plan":15,"nudge":2,"retrospective":0}`

**⚠️ Finding — New Episode Not Committed:**
- `episodes/ep_plan_016.json` exists (created 17:50, matching task 863-260409-174540) but shows as `??` (untracked)
- The `.seq` file correctly s
...(truncated)
