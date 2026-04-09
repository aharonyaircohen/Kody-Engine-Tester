# feat: memory nudge — LLM-driven pattern extraction

## Description
Enable memory nudge feature: after a successful pipeline, an LLM reviews task artifacts and writes useful patterns to graph memory.

## What to implement
Enable the memory nudge feature by adding to `kody.config.json`:
```json
"memory": {
  "nudgeEnabled": true
}
```
Or set env var `KODY_MEMORY_NUDGE=true` when running the pipeline.

## Verification steps
After the pipeline completes, check:
1. `.kody/graph/episodes/ep_nudge_*.json` — nudge episodes created
2. `.kody/graph/nodes.json` — new fact/convention/thought nodes
3. Run `kody graph query . nudge` or `kody graph search . <pattern>`

## How to test
Comment `@kody run` on this issue to trigger CI pipeline.

---

## Discussion (3 comments)

**@aguyaharonyair** (2026-04-09):
Testing nudge feature with KODY_MEMORY_NUDGE=true

**@aguyaharonyair** (2026-04-09):
@kody run

**@aharonyaircohen** (2026-04-09):
🚀 Kody pipeline started: `run` ([logs](https://github.com/aharonyaircohen/Kody-Engine-Tester/actions/runs/24194982377))

To rerun: `@kody rerun run --from <stage>`

