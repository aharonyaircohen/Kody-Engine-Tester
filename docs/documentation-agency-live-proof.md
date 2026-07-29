## 1. Reader outcome

This document is for maintainers of `Kody-Engine-Tester` who read `.kody-engine/definitions/` paths directly and act as the operator of the Documentation Agency.

After reading, you can:

1. Name the Documentation Lead agent and the three specialist roles that sit under it.
2. List the 10 main-workflow capabilities in execution order and cite their step ids.
3. List the 11th capability that lives in the separate maintenance workflow.
4. Describe the 7-day maintenance loop and its target workflow.
5. State the four revision-limit caps declared in `workflow.json`.
6. Explain the explicit-approval gate and the blocked-status contract shape.
7. Distinguish immediate CMS publication from repository pull-request delivery.

## 2. Who runs the agency

### 2.1 Documentation Lead agent

The lead is declared at `.kody-engine/definitions/agents/documentation-lead.md`. Lines 8-11 state its role: "accountable editor for technical documentation" that turns an operator's request into a clear evidence plan, delegates, reconciles disagreements, and delivers one coherent document. Lines 15-26 enumerate the qualities: audience first, evidence before prose, clear ownership (researchers, writers, reviewers, lead), one voice, useful detail, honest uncertainty. Lines 30-32 capture the hard rule: "Never trade correctness for polish."

### 2.2 Three specialist roles

Each specialist appears as frontmatter `name:` on line 2 of its agent file under the relevant capability's `tools/agents/` folder:

- **Researcher** — `.kody-engine/definitions/capabilities/define-documentation-brief/tools/agents/documentation-researcher.md`, `.kody-engine/definitions/capabilities/collect-documentation-evidence/tools/agents/documentation-researcher.md`, `.kody-engine/definitions/capabilities/documentation-draft/tools/agents/documentation-researcher.md` (co-located).
- **Writer** — `.kody-engine/definitions/capabilities/design-documentation-set/tools/agents/documentation-writer.md`, `.kody-engine/definitions/capabilities/documentation-draft/tools/agents/documentation-writer.md` (co-located), `.kody-engine/definitions/capabilities/revise-documentation/tools/agents/documentation-writer.md`.
- **Reviewer** — `.kody-engine/definitions/capabilities/documentation-draft/tools/agents/documentation-reviewer.md` (co-located), `.kody-engine/definitions/capabilities/test-documentation-examples/tools/agents/documentation-reviewer.md`, `.kody-engine/definitions/capabilities/verify-documentation-accuracy/tools/agents/documentation-reviewer.md`, `.kody-engine/definitions/capabilities/review-documentation-quality/tools/agents/documentation-reviewer.md`, `.kody-engine/definitions/capabilities/verify-published-documentation/tools/agents/documentation-reviewer.md`.

### 2.3 Honest gaps

- `.kody-engine/definitions/capabilities/publish-documentation/tools/` contains only `.gitkeep`. The lead owns the publish step by being the workflow agent (`.kody-engine/definitions/workflows/documentation-agency/workflow.json:3`), not by capability-level declaration.
- `documentation-draft/tools/agents/` co-locates all three specialists; the step executor is not pinned to one.

## 3. Main workflow — capability sequence

The 10 capabilities in execution order, with step ids from `workflow.json:4-15` and `startAt: "brief"` from line 175:

1. `define-documentation-brief` — step `brief` — define audience, reader outcome, scope, acceptance criteria.
2. `collect-documentation-evidence` — step `evidence` — build a source-backed fact and unknowns ledger.
3. `design-documentation-set` — step `design` — design the smallest complete document set and navigation.
4. `documentation-draft` — step `draft` — write a complete evidence-backed documentation draft.
5. `test-documentation-examples` — step `examples` — safely test commands, samples, and reader procedures.
6. `verify-documentation-accuracy` — step `accuracy` — trace material claims to current source evidence.
7. `review-documentation-quality` — step `quality` — independently verify clarity, completeness, reader success.
8. `revise-documentation` — step `revise` — apply only verified findings and return the full revised document.
9. `publish-documentation` — step `publish` — after explicit approval, create or update the selected publishing surface.
10. `verify-published-documentation` — step `verify-published` — verify the actual published result rather than only the write operation.

## 4. Branching graph and the four revision-limit caps

### 4.1 Linear opening chain

`brief → evidence → design → draft → examples` is linear (`.kody-engine/definitions/workflows/documentation-agency/workflow.json:17-60`).

### 4.2 examples branching

`examples` branches on `result.status` (lines 66-84). `pass` routes to `accuracy` (line 68-72). `fail` routes to `revise` with `maxIterations: 3` (lines 73-79, esp. 78). The default branch ends the run (line 81).

### 4.3 accuracy branching

`accuracy` branches similarly (lines 91-109). `pass` routes to `quality` (lines 92-97). `fail` routes to `revise` with `maxIterations: 3` (lines 98-104, esp. 103). Default ends the run (line 106).

### 4.4 quality branching

`quality` branches (lines 116-134). `pass` routes to `publish` (lines 117-122). `revise` routes to `revise` with `maxIterations: 3` (lines 123-129, esp. 128). Default ends the run (line 131).

### 4.5 revise loop

`revise` loops back to `examples` unconditionally with `maxIterations: 9` (lines 141-146). "Unconditional" here means no result-status gate is applied on the `revise` edge itself — unlike the `examples`, `accuracy`, and `quality` branches above, which each inspect `result.status` before choosing a successor. The 9-iteration cap is the only constraint on the `revise → examples` loop.

### 4.6 Cap summary

| Edge | Cap |
| --- | --- |
| examples → revise | 3 |
| accuracy → revise | 3 |
| quality → revise | 3 |
| revise → examples | 9 |

### 4.7 Honest limit

`workflow.json` declares the numeric caps but no inspected file describes the observable end-state when a cap is exhausted. This document stops at the declared values.

## 5. Approval gate and blocked-status behavior

Explicit human approval is mandatory. If approval is absent, ambiguous, or older than the reviewed revision, publish returns a blocked envelope. Cite `.kody-engine/definitions/capabilities/publish-documentation/instructions.md:6-18` for the exact envelope: `status: blocked`, `location: ""`, `change_record: ""`, summary "Explicit human approval is required before publication."

The publish contract enum is exactly `{published, proposed, blocked}`. Required fields are `status`, `location`, `change_record`, `summary`; `additionalProperties: false` (`.kody-engine/definitions/capabilities/publish-documentation/contract.json:22-47`).

## 6. CMS publication vs repository pull-request delivery

- **CMS adapter** — returns `status: published` with canonical location and a durable change identifier (`.kody-engine/definitions/capabilities/publish-documentation/instructions.md:28-30`).
- **Repository files** — returns `status: proposed`. The capability edits the approved files; the workflow delivery wrapper owns branch, commit, push, and pull request. The pull request is the change record and still needs its normal merge approval (`.kody-engine/definitions/capabilities/publish-documentation/instructions.md:25-28`).
- The publish step declares `delivery: "pull-request"` (`.kody-engine/definitions/workflows/documentation-agency/workflow.json:153`).
- **Hard rules** (lines 20-23): create or update only; never delete; never overwrite unrelated content; never create a parallel publishing store; preserve the selected system's normal permissions, history, and transport.
- **Honest limits**: the concrete CMS adapter name and the runtime that creates the branch/commit/PR are not visible in the inspected sources. The line is cited; the runner is not invented.

## 7. Maintenance workflow — Maintain Documentation

Separate workflow, same lead agent (`.kody-engine/definitions/workflows/maintain-documentation/workflow.json:2-3`). Exactly one capability: `detect-documentation-drift` (lines 1-6; step `detect-drift`, lines 7-16, with `input.mode: repository-documentation-maintenance`).

The capability is a read-only drift sweep that invokes `documentation-researcher`. It does not rewrite, publish, delete, commit, or silently change documentation; it returns `current` with empty findings and proposals when no verified drift is found (`.kody-engine/definitions/capabilities/detect-documentation-drift/instructions.md:1-12`). Maintenance observes and proposes; it does not publish.

## 8. Weekly maintenance loop

The loop is defined at `.kody-engine/definitions/loops/documentation-maintenance/loop.json:2-14`:

- **id** — `documentation-maintenance`.
- **trigger** — `type: schedule`, `every: 7d`.
- **target** — workflow `maintain-documentation`.
- **input** — `mode: repository-documentation-maintenance`.
- **enabled** — `true`.

The main creation workflow is issue-driven. No parallel `loop.json` exists for `documentation-agency`; only the maintenance path has a 7-day loop.

## 9. Operator walk-through

Invocation surface as declared in `workflow.json`:

- `name` and `agent` (`workflow.json:2-3`).
- Capability sequence (`workflow.json:4-15`).
- `delivery: pull-request` on the publish step (`workflow.json:153`).
- `startAt: brief` (`workflow.json:175`).

Step-by-step path a maintainer-operator passes through on an issue:

1. `.kody-engine/definitions/workflows/documentation-agency/workflow.json` — read invocation surface.
2. `.kody-engine/definitions/agents/documentation-lead.md` — confirm the lead identity.
3. `.kody-engine/definitions/capabilities/define-documentation-brief/instructions.md` — step `brief`.
4. `.kody-engine/definitions/capabilities/collect-documentation-evidence/instructions.md` — step `evidence`.
5. `.kody-engine/definitions/capabilities/design-documentation-set/instructions.md` — step `design`.
6. `.kody-engine/definitions/capabilities/documentation-draft/instructions.md` — step `draft`.
7. `.kody-engine/definitions/capabilities/test-documentation-examples/instructions.md` — step `examples`.
8. `.kody-engine/definitions/capabilities/verify-documentation-accuracy/instructions.md` — step `accuracy`.
9. `.kody-engine/definitions/capabilities/review-documentation-quality/instructions.md` — step `quality`.
10. `.kody-engine/definitions/capabilities/revise-documentation/instructions.md` — step `revise` (if invoked by a fail).
11. `.kody-engine/definitions/capabilities/publish-documentation/instructions.md` and `contract.json` — step `publish`, then branch by `status`.
12. `.kody-engine/definitions/capabilities/verify-published-documentation/instructions.md` — step `verify-published`.

**Honest note**: no CLI binary, no `tools/scripts/run-*`, and no REST endpoint is present under `.kody-engine/definitions/implementations/`. Describe the `workflow.json` invocation surface and do not invent a command.

## 10. Source-of-truth pin

`.kody-engine/definitions/manifest.json` pins the definitions as hydrated Store state:

- Lines 2-4: `schemaVersion: 1`, `tenantId: aharonyaircohen/Kody-Engine-Tester`, `hydratedAt: 2026-07-29T20:57:18.343Z`.
- Line 25: `workflow:documentation-agency` pinned at `sha256:0db2b06844f92568495f6b3ddde38a83b2cd4c73594a2d2f5dc915a4b2be7e8a`.
- Line 27: `workflow:maintain-documentation` pinned at `sha256:38121ca412ef9cffbb2ee0e94d33a9c20c1be9e120ee3aef7b7a9a8654dfef40`.

## 11. Known limits of this document

- Specialist executor for publish is not capability-declared; the lead owns it as workflow agent.
- Specialist executor for documentation-draft is not pinned; all three specialists co-locate.
- CMS adapter name is not named in the hydrated definitions; only the contract shape is documented.
- The runtime that creates the PR is not present in the inspected sources.
- Cap-exhaustion end-state is not described in the inspected sources.
- `docs/` contains only test stubs (`CONFLICT_TEST.md`, `RESOLVE_TEST_1776631230.md`, `stack-v9.md` through `stack-v12.md`, `test-prd.md`); this document is the first narrative file in that directory.