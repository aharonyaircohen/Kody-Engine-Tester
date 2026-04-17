# Plan: P3T12 — Verify --from <stage> flag

## Context

P3T12 is a **verification-only chore** (risk: low). No code changes are required. The `--from <stage>` flag is already implemented in the Kody Engine CLI (`@kody-ade/engine`).

The test runs in two steps:
1. **Step 1 (done):** `@kody` fires the full pipeline — taskify, plan, build, verify, review, review-fix, ship. Currently in "build" stage (status.json shows `build.state: "running"`).
2. **Step 2 (pending):** After step 1 completes, the test-suite agent's nohup monitor (agent.md lines 665–688) auto-fires `@kody --from build` on the same issue (#2433).

Verification criteria: Second pipeline logs show `"Resuming from: build"`, taskify and plan stages are skipped, build stage runs.

---

## Implementation Overview (no changes needed)

The `--from` flag is fully implemented in `@kody-ade/engine`:

### Flag parsing (`dist/bin/cli.js`)
- **Line 8888–8889:** `--from` argument is parsed via regex: `argsLine.match(/--from[=\s]+(\S+)/)` → `fromStage`
- Also accepted as `--from=<stage>` via CLI args (line 17524)
- `rerun --from <stage>` accepted (line 17500)

### Pipeline logic (`dist/bin/cli.js` — runPipeline)
- **Line 17122:** `fromStage = ctx.input.fromStage`
- **Line 17123:** `let startExecution = !fromStage` — if `fromStage` is set, startExecution is `false`
- **Line 17126:** `if (fromStage) logger.info(\`Resuming from: ${fromStage}\`)` — **this is the log line the test verifies**
- **Lines 17144–17151:** Stage loop — when `startExecution` is `false`, stages before `fromStage` are `continue`d (skipped)
- **Lines 17152–17154:** Completed stages are also skipped (`already completed, skipping`)

### Stage order (`STAGE_ORDER`)
`["taskify", "plan", "build", "verify", "review", "review-fix", "ship"]`

### Nohup monitor (test-suite agent.md lines 665–688)
- Polls issue #2433 labels every 30 seconds (up to 60 iterations)
- When `kody:done` or `kody:failed` appears, fires `@kody --from build`

---

## What Needs to Be Done (monitoring only)

Since the `--from` implementation is already complete and the test is fully automated via the nohup monitor, this session should **monitor for the second pipeline** and verify the criteria.

### Step 1: Wait for first pipeline to complete
```bash
gh issue view 2433 --json labels --jq '[.labels[].name]'
```
Watch for `kody:done` or `kody:failed` label.

### Step 2: After step 1 completes, verify nohup fired --from build
The nohup monitor (lines 665–688) fires `@kody --from build` automatically.
```bash
gh issue view 2433 --json comments --jq '.[-1].body'
```
Check that the last comment is the `--from build` trigger from the nohup script.

### Step 3: Wait for second pipeline to start and check logs
```bash
cat .kody/tasks/2433-260417-234853/status.json
```
Second pipeline creates a **new task directory** (e.g., `2433-260417-235xxx`). Check that new status.json:
- `build.state: "running"` (not taskify/plan)
- `taskify.state: "pending"` and `plan.state: "pending"`

Alternatively, check the second pipeline's logs for:
- `"Resuming from: build"`
- `"[taskify] skipped"` or `"[taskify] already completed, skipping"`
- `"[plan] skipped"` or `"[plan] already completed, skipping"`
- `"[build] starting..."`

### Step 4: Wait for second pipeline to complete
Watch for `kody:done` on issue #2433 again.

---

## Files Referenced

| File | Role |
|------|------|
| `node_modules/@kody-ade/engine/dist/bin/cli.js` | `--from` flag implementation |
| `.kody/watch/agents/test-suite/agent.md` | Nohup monitor (lines 665–688) |
| `.kody/tasks/2433-260417-234853/task.json` | Task metadata |
| `.kody/tasks/2433-260417-234853/status.json` | Current pipeline state |

## Verification Checklist

- [ ] First pipeline completes (`kody:done` or `kody:failed` on issue #2433)
- [ ] Nohup monitor fires `@kody --from build` (new comment on issue #2433)
- [ ] Second pipeline starts (new task directory created)
- [ ] Second pipeline logs contain `"Resuming from: build"`
- [ ] Second pipeline skips taskify and plan stages
- [ ] Second pipeline build stage runs
- [ ] Second pipeline completes (`kody:done` on issue #2433)
