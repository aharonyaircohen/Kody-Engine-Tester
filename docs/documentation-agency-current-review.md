# Documentation agency usage guide

This guide explains how repository maintainers and operators use the Kody documentation agency to produce a verified, evidence-backed documentation draft and deliver it for human review by pull request. It is a practical companion to the workflow hydrated in this consumer repository from the Kody company Store.

## Orientation

The documentation agency is run by the **Documentation Lead** agent, the accountable editor for evidence-backed business, product, and technical documentation. The Lead's operating qualities are audience first, evidence before prose, clear ownership, one voice, useful detail, and honest uncertainty.

The Lead follows one hard rule:

> Never trade correctness for polish. A shorter verified document is better than a detailed document that claims behavior the available evidence does not support.

Concretely this means:

- Every claim in the draft must be traceable to an inspected source.
- Recommendations, hypotheticals, and unverified behavior are separated from current verified behavior rather than blended into prose.
- Honest uncertainties are flagged rather than smoothed over.

Delivery is pull-request only. The agency drafts the document on a separate branch, opens a pull request for human review, and never merges or writes directly to `main`. The agency is not authorized to claim any Chat routing behavior; such claims are excluded from this guide.

The agency's identity is documented in `agents/documentation-lead.md`. Concrete scope, tools, inputs, and output rules belong to the capability being executed at each step.

## Prerequisites

Before starting the workflow, confirm the following with your operator:

- Kody Engine has hydrated the `documentation-agency` workflow and the `define-documentation-brief` capability into this repository. The local files at `.kody-engine/definitions/workflows/documentation-agency/workflow.json` and `.kody-engine/definitions/capabilities/define-documentation-brief/` must be present and not empty.
- The operator can write to a feature branch and open or review pull requests against `main`.
- A source issue exists that supplies all six brief fields (see next section).

If any of the above is missing, stop and resolve it before invoking the workflow.

## Prepare the request

The workflow consumes two inputs: an integer `issue` reference and a `brief` object.

The `brief` object carries six fields. All six are marked required in the Store workflow's `inputSchema`; the local `define-documentation-brief` contract defines `brief` as a bare object and does not enumerate these sub-fields as required.

| Field | Purpose |
| --- | --- |
| `subject` | The topic the document covers. |
| `audience` | The reader the document is written for. |
| `desiredOutcome` | What the reader should be able to do after reading. |
| `documentType` | The genre (usage guide, reference, runbook, and so on). |
| `authoritativeSources` | Sources the Lead may inspect to ground claims. |
| `destination` | The branch-relative file path the draft will be written to. |

The Lead reconciles these fields against the linked issue. The repository for the issue is resolved from the `GITHUB_REPOSITORY` environment variable; it is not inferred from the `subject`, `authoritativeSources`, or `destination` fields.

If the request lacks enough evidence to define a safe scope, the Lead returns `status: blocked` rather than proceeding.

## Run the creation workflow

The workflow executes ten capabilities in order. Each step in `workflow.json` carries both a `capability` field (the capability name) and an `id` field (the step identifier); these are distinct values. The bolded labels below are the capability names; the corresponding step ids are listed in monospace immediately after.

1. **`define-documentation-brief`** (step id `brief`) — Resolve the issue, invoke the `documentation-researcher` subagent, reconcile the six brief fields, and return the structured brief contract.
2. **`collect-documentation-evidence`** (step id `evidence`) — Inspect each authoritative source and gather citations.
3. **`design-documentation-set`** (step id `design`) — Plan the document structure against the brief and evidence.
4. **`documentation-draft`** (step id `draft`) — Produce the prose. Proceeds unconditionally from design.
5. **`test-documentation-examples`** (step id `examples`) — Exercise every code, command, or path example. Runs only when the draft returns `result.status === 'pass'`.
6. **`verify-documentation-accuracy`** (step id `accuracy`) — Re-check claims against the inspected sources. Triggered when the prior step (`test-documentation-examples`) returns `result.status` of `pass` or `changed`. Routes to `review-documentation-quality` on `result.status` of `pass` or `changed`.
7. **`review-documentation-quality`** (step id `quality`) — Editorial pass for clarity, voice, and audience fit. Routes to `publish` on `pass`, or to `revise` on `changed`. The revision loop is bounded by `maxIterations: 3`.
8. **`revise-documentation`** (step id `revise`) — Apply corrections from the quality review. Default `next` is `test-documentation-examples`. Bounded by `maxIterations: 3`.
9. **`publish-documentation`** (step id `publish`) — Deliver the draft by pull request. `delivery: pull-request` is the only declared delivery mode. Requires `result.status === 'pass'`.
10. **`verify-published-documentation`** (step id `verify-published`) — Confirm the published artifact matches the brief and the contract. Terminal state.

Transitions that are not declared in `workflow.json` (for example, from statuses outside `pass` and `changed`) are not part of the verified behavior.

## Review corrections and approve publication

The `review-documentation-quality` step (step id `quality`) is the editorial gate. It returns `pass` to proceed to `publish-documentation`, or `changed` to route the workflow back into `revise-documentation`.

The revision loop is bounded: `maxIterations: 3` is set on the `quality->revise` and `revise->examples` transitions in `workflow.json`. The workflow definition does not declare an exhaustion transition or a post-cap action; the behavior after the third revision is therefore not specified by `workflow.json` and falls to the human reviewer to determine.

The `publish-documentation` step (step id `publish`) has only one transition declared in `workflow.json`: its `next` rule contains a single `when` clause, `result.status === 'pass'`. The phrase "After explicit approval" appears in the step's free-text `reason` field but is not a `when` clause in the workflow definition; human approval is therefore a process expectation documented in this guide, not a transition enforced by `workflow.json`.

The agency does not merge. Final publication authority belongs to a human reviewer; the agency only prepares the pull request.

## Publish and verify by pull request

When the publish step is reached with `pass` (and human approval per the process expectation), the agency:

- Writes the draft to the `destination` path on a separate branch.
- Opens a pull request against `main` for human review.
- Transitions to `verify-published-documentation` on `pass`, or ends on the default path.

The destination path proposed by this guide is `docs/documentation-agency-current-review.md` on a separate branch, opened as a pull request. The pull request is not merged and is not written directly to `main`; both actions are excluded by the request that authorizes this guide.

Whether the `-current-review` suffix is a temporary review name or a final name is not confirmed by the available evidence; flag this rather than assume.

## Outputs and contract reference

A completed run produces:

- A separate branch containing the draft at the `destination` path.
- A pull request URL for human review.
- A structured record per capability executed.
- For `define-documentation-brief` specifically: an object containing `version` (constant `1`), `status` (enum `pass` or `blocked`), `summary`, `audience`, `purpose`, `scope` (array), `acceptance_criteria` (array), and `source_evidence` (array). All fields are required and `additionalProperties` is `false`.

The `source_evidence` array must list only sources that were actually inspected. Sources inferred or assumed from the brief fields alone are not permitted.

## When the workflow cannot proceed

Only the following blocked paths are evidenced:

- The brief returns `status: blocked` when the request lacks enough evidence to define a safe scope. The workflow halts at `define-documentation-brief`.
- The revision loop reaches its `maxIterations: 3` bound on the `quality->revise` or `revise->examples` transitions. `workflow.json` declares no exhaustion transition, so behavior after the cap is not specified; the human reviewer decides what happens next.
- A non-`pass`, non-`changed` status reaches a step whose `next` rule is not declared for that status. The workflow has no documented transition for that case.

In each case, surface the blockage to the human reviewer with the relevant capability output rather than retrying silently.

## Known limits and open decisions

The following points are not resolved by the available evidence and are flagged honestly:

- **Final merge authority.** The authorizing issue approves opening a pull request for human review but does not name a specific reviewer, team, or required number of approvals.
- **Draft retention.** Once merged, whether the draft file is renamed, archived, or deleted is not declared by the workflow or the authorizing issue.
- **"Safe" publication.** The authorizing issue describes a human-approval gate qualitatively. No checklist or threat model is supplied for what counts as safe, and `workflow.json` does not enforce human approval as a `when` clause.
- **`-current-review` filename.** Whether the suffix indicates a temporary review name or a final published name is not confirmed.
- **Per-capability contracts.** Only the `define-documentation-brief` `contract.json` and `instructions.md` were inspected for this guide. The remaining nine capability contracts were not inspected in detail.
- **Post-revision-cap behavior.** `workflow.json` declares `maxIterations: 3` on the `quality->revise` and `revise->examples` transitions but no exhaustion rule. What happens at or after the third revision is therefore not specified by the workflow definition.

These items are flagged as open decisions for the human reviewer rather than answered by this guide.

## Evidence references appendix

The following sources were inspected to produce this guide:

- Inspected Store workflow: `catalog/workflows/documentation-agency` (`workflow.json`) in `kody-company-store`. The step `id` values, in execution order, are `brief`, `evidence`, `design`, `draft`, `examples`, `accuracy`, `quality`, `revise`, `publish`, `verify-published`.
- Inspected Store capabilities catalog: `catalog/capabilities` in `kody-company-store`. A directory exists for every one of the ten workflow capabilities.
- Inspected Store agent definition: `agents/documentation-lead.md` in `kody-company-store`.
- Active Kody Engine workflow definition in the consumer repo: `.kody-engine/definitions/workflows/documentation-agency/workflow.json`.
- Active Kody Engine capability definition for the first step: `.kody-engine/definitions/capabilities/define-documentation-brief/contract.json` and `instructions.md`.
- Active Kody Engine agent definition in the consumer repo: `.kody-engine/definitions/agents/documentation-lead.md`.
- GitHub issue #3937, 'Review run: create a complete documentation agency usage guide', state `OPEN`, label `kody:reviewing`, five comments spanning 2026-07-30 to 2026-08-01. Comment 3 (2026-07-30T19:17:30Z) authorizes creating or updating `docs/documentation-agency-current-review.md` on a separate branch and opening a pull request for human review, and explicitly excludes merging the pull request and writing directly to `main`.
- GitHub PR #3938, state `OPEN`, `merged=false`, `draft=false`, `mergeable_state=clean`, one commit on head branch `3937-review-run-create-a-complete-documentation-agency` (`8686723aab0aec668c3cd08743d7f3f8696eb131`) against `main` (`c909072dbcb3a96fa15f8b067faf9a623ed67060`), label `kody:reviewing`, modifying `docs/documentation-agency-current-review.md` with 185 additions.
