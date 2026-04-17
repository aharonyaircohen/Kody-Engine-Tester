# Plan: P2T05 — Verify @kody approve resumes paused pipeline

## Context

This is a Phase 2 dependent test from the Kody Engine E2E test suite (run-20260417-1832). It verifies that `@kody approve` on a paused issue (P1T03, a HIGH complexity task that hits the risk gate) correctly resumes the pipeline from the plan stage.

- **P2T05 issue:** #2299 — the current build-stage agent session
- **P1T03 issue:** #2284 — HIGH complexity, paused at plan stage (risk gate), already received `@kody approve`
- **Verification goal:** Confirm P1T03 pipeline resumed and completed after `@kody approve`

The auto-approve monitor (from `do_fire`) already posted `@kody approve` on P1T03 (issue #2284) before this build stage ran. P1T03's workflow run 24581794600 is queued and will execute the build stage of P1T03's JWT migration task.

## What to do

### Step 1 — Verify @kody approve was posted on P1T03

P1T03 = issue #2284. Confirm the approval comment exists:
```
gh api repos/aharonyaircohen/Kody-Engine-Tester/issues/2284/comments --jq '.[-1].body'
```
Expected: includes `@kody approve` and the 3 guidance items. ✓ (already confirmed — comment exists)

### Step 2 — Poll P1T03 until pipeline completes (kody:done or kody:failed)

P1T03 workflow run 24581794600 is queued. Poll until done:

```bash
for i in $(seq 1 60); do
  labels=$(gh issue view 2284 --json labels --jq '[.labels[].name] | join(",")')
  echo "[$(date +%H:%M:%S)] Issue 2284 labels: $labels"
  if echo "$labels" | grep -q "kody:done"; then
    echo "PASS: P1T03 pipeline completed successfully"
    break
  elif echo "$labels" | grep -q "kody:failed"; then
    echo "FAIL: P1T03 pipeline failed"
    break
  fi
  sleep 30
done
```

### Step 3 — Post verification result on P2T05 issue (#2299)

Once P1T03 reaches `kody:done` or `kody:failed`, post the verification result:

```bash
gh issue comment 2299 --body "## P2T05 Verification

**P1T03 issue:** #2284

**State after @kody approve:**
- Labels: <final labels from polling>
- Pipeline status: PASS/FAIL

**Verification result:** PASS/FAIL — pipeline resumed from risk gate and completed."
```

## Critical files

- `.kody/tasks/2299-260417-184411/task.md` — task description
- `node_modules/@kody-ade/engine/dist/bin/cli.js` — `@kody approve` implementation (mode → "rerun" with plan stage override)
- `P1T03 issue #2284` — paused issue that received approval
- `P2T05 issue #2299` — this session's issue, where result is posted
