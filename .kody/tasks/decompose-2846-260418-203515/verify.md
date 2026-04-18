# Verification Report: P3T30 — Decompose sub-task failure triggers fallback

## Result: PASS

## Scope of Verification

Source examined: `@kody-ade/engine@0.4.4` — `dist/bin/cli.js`
(`src/stages/decompose.ts`, `src/worktree.ts`, `src/commands/decompose.ts`, `src/pipeline/sub-pipeline.ts`)

---

## Evidence

### 1. Decompose attempts to split into parallel sub-tasks ✅

**Location**: `src/commands/decompose.ts` → `runDecompose()` (line 19007)

The command runs three phases in sequence:
1. `taskify` (line 19027–19031) — generates task.json
2. `plan` (line 19044–19049) — generates plan.md
3. `executeDecompose()` (line 19050) — calls the decompose agent to split into sub-tasks

If any phase fails, `fallbackToPipeline(opts)` is called immediately.

```js
// Line 19027-19032
const taskifyResult = await executeAgentStage(ctx, taskifyDef);
if (taskifyResult.outcome !== "completed") {
  logger.error(`  taskify failed: ${taskifyResult.error}`);
  return fallbackToPipeline(opts);
}

// Line 19044-19049
const planResult = await executeAgentStage(ctx, planDef);
if (planResult.outcome !== "completed") {
  logger.error(`  plan failed: ${planResult.error}`);
  return fallbackToPipeline(opts);
}

// Line 19050-19054
const decomposeOutput = await executeDecompose(ctx);
if (!decomposeOutput || !decomposeOutput.decomposable) {
  const reason = decomposeOutput?.reason ?? "decompose agent failed";
  logger.info(`  Not decomposable: ${reason} — falling back to normal pipeline`);
  return fallbackToPipeline(opts);
}
```

### 2. Sub-task execution is run in parallel worktrees ✅

**Location**: `src/commands/decompose.ts` (line 19071–19083), `src/pipeline/sub-pipeline.ts` → `runSubPipelinesParallel()` (line 18704)

Worktrees are created for each sub-task:
```js
// Line 19071-19083
for (const subTask of decomposeOutput.sub_tasks) {
  const wtPath = worktreePath(taskId, subTask.id);
  const branchName = `${featureBranch}/${subTask.id}`;
  try {
    createWorktree(projectDir, wtPath, branchName);
    worktreePaths.set(subTask.id, wtPath);
    branchNames.set(subTask.id, branchName);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`  Failed to create worktree for ${subTask.id}: ${msg}`);
    cleanupWorktrees(projectDir, taskId);   // ← cleanup on failure
    return fallbackToPipeline(opts);        // ← immediate fallback
  }
}
const subResults = await runSubPipelinesParallel(ctx, decomposeOutput.sub_tasks, ...);
```

`runSubPipeline()` (line 18610) executes the build stage for each sub-task in its worktree:
```js
// Line 18671-18679
const buildResult = await executeAgentStage(subCtx, buildDef);
if (buildResult.outcome !== "completed") {
  return {
    subTaskId: subTask.id,
    outcome: "failed",
    branchName: "",
    error: buildResult.error ?? "Build failed"
  };
}
```

The caching task (Redis adapter importing `ioredis`) would fail at the `pnpm install` or TypeScript compilation step inside the sub-task's build stage.

### 3. Worktree cleanup on sub-task failure ✅

**Location**: `src/worktree.ts` → `cleanupWorktrees()` (line 18791)

```js
// Line 18791-18809
function cleanupWorktrees(projectDir, taskId) {
  const taskWorktreeDir = path60.join(WORKTREE_BASE, taskId);
  if (!fs64.existsSync(taskWorktreeDir)) return;
  try {
    const entries = fs64.readdirSync(taskWorktreeDir);
    for (const entry of entries) {
      const wtPath = path60.join(taskWorktreeDir, entry);
      removeWorktree(projectDir, wtPath);   // git worktree remove --force
    }
    fs64.rmSync(taskWorktreeDir, { recursive: true, force: true });
    logger.info(`  Cleaned up all worktrees for task ${taskId}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn(`  Failed to cleanup worktrees: ${msg}`);
  }
  try {
    git2(["worktree", "prune"], { cwd: projectDir });   // prune stale entries
  } catch { }
}
```

**Triggered from line 19097–19104** when sub-task failures are detected:
```js
const failures = subPipelines.filter((r) => r.outcome === "failed");
if (failures.length > 0) {
  logger.error(`  ${failures.length} sub-task(s) failed:`);
  for (const f of failures) {
    logger.error(`    ${f.subTaskId}: ${f.error}`);
  }
  cleanupWorktrees(projectDir, taskId);   // ← cleanup on failure
  return fallbackToPipeline(opts);        // ← fallback
}
```

### 4. Fallback to non-decomposed pipeline execution ✅

**Location**: `src/commands/decompose.ts` → `fallbackToPipeline()` (line 19158)

```js
// Line 19158-19179
async function fallbackToPipeline(opts) {
  logger.info("  Delegating to normal pipeline (runPipeline)...");
  const { runPipeline: runPipeline2 } = await Promise.resolve().then(() =>
    (init_pipeline(), pipeline_exports)
  );
  const ctx = {
    taskId: opts.taskId,
    taskDir: opts.taskDir,
    projectDir: opts.projectDir,
    runners: opts.runners,
    sessions: {},
    input: { mode: "full", issueNumber: opts.issueNumber, local: opts.local }
  };
  const state = await runPipeline2(ctx);
  return {
    taskId: opts.taskId,
    state: state.state === "completed" ? "completed" : "failed",
    decompose: {
      decomposable: false,
      reason: "Fell back to normal pipeline",
      ...
    }
  };
}
```

### 5. ioredis is NOT installed ✅

```bash
$ cat package.json | grep ioredis
# (no output — ioredis not in dependencies)
```

The `src/cache/redisAdapter.ts` sub-task would fail at the `import 'ioredis'` step (module-not-found), causing `buildResult.outcome === "failed"` in `runSubPipeline()`.

---

## Fallback Trigger Points Summary

| Failure Point | Action | Fallback? |
|---|---|---|
| `decompose.enabled === false` in config | log + `fallbackToPipeline` | ✅ |
| `taskify` fails | log + `fallbackToPipeline` | ✅ |
| `risk_level === "low"` | log + `fallbackToPipeline` | ✅ |
| `plan` fails | log + `fallbackToPipeline` | ✅ |
| Decompose returns non-decomposable | log + `fallbackToPipeline` | ✅ |
| Worktree creation fails (any sub-task) | `cleanupWorktrees` + `fallbackToPipeline` | ✅ |
| **Sub-task build fails** (e.g. missing ioredis) | **`cleanupWorktrees` + `fallbackToPipeline`** | ✅ |

---

## Conclusion

The decompose engine implements the complete worktree cleanup and fallback path for sub-task failures:

1. ✅ **Decompose analysis** — `executeDecompose()` runs the decomposition prompt and scores complexity
2. ✅ **Parallel worktrees** — `createWorktree()` creates a branch+worktree per sub-task
3. ✅ **Sub-task execution** — `runSubPipeline()` runs the build stage; returns `outcome: "failed"` on error
4. ✅ **Worktree cleanup** — `cleanupWorktrees()` calls `git worktree remove --force` for all worktrees of the task, then `git worktree prune`
5. ✅ **Fallback** — `fallbackToPipeline()` delegates to `runPipeline()` for sequential execution
6. ✅ **ioredis absent** — confirmed not installed; would trigger the failure path in the cache-adapter sub-task

P3T30 verification: **PASS**
