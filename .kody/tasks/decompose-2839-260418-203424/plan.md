The plan has been written to `plan.md`. Here's the summary:

---

## Plan: P3T27 — Verify decompose.enabled=false fallback behavior

**3 steps:**

1. **Add `decompose` section to `kody.config.json`** — Add `"decompose": { "enabled": false }` so the config is self-consistent and the engine can find `config.decompose.enabled` at runtime.

2. **Implement the feature-flag guard** — In the command dispatcher (verify the exact file with Grep first), check `config.decompose?.enabled` before the decompose pipeline runs. If `false`, log `"decompose disabled in config — falling back"` and call `runPipeline()` instead — skipping all decompose-specific logic (sub-task creation, worktrees, etc.).

3. **Restore `decompose.enabled = true`** — After verification, change the config default back to `true` for normal operation.

---

**Pattern reuse:**
- Config-driven flags follow the existing pattern of reading `kody.config.json` at runtime for stage/budget/MCP settings
- The guard follows the same early-return/log pattern used by other pipeline feature flags
- Log-based verification follows the P3 test convention (T17, T21, T22 all use `grep -i` on GitHub Actions logs)

**Questions:** None — the implementation approach is straightforward given existing routing architecture.

The `plan.md` file is ready in the task directory. Next step is **build** — implementing the guard in the dispatch layer and adding the config section.