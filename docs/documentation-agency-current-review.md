# The Kody Documentation Agency — Usage Guide

Practical usage guide for repository maintainers and operators who request, review, and publish documentation through the Kody Documentation Agency workflow.

## 1. Overview

The Documentation Agency is a Kody workflow that turns a single GitHub issue into a complete, evidence-backed documentation deliverable and opens a pull request for human review. The workflow is bound to the documentation-lead agent — the accountable editor for evidence-backed business, product, and technical documentation. Its hard rule: never trade correctness for polish; a shorter verified document is better than a detailed document that claims behavior the available evidence does not support.

Use the agency when you need:

- A document whose claims are traceable to current source evidence
- A consistent pipeline through brief → evidence → design → draft → examples → accuracy → quality → revise → publish → verify-published
- A pull-request delivery surface that requires explicit human approval before any change touches the target branch

Do not use the agency for:

- One-off prose rewrites that do not need a structured pipeline
- Work that should land directly on main or bypass human review — the publish step requires explicit approval and the workflow delivery owns the PR
- Work that depends on Chat routing behavior — the agency does not declare any Chat routing and the evidence does not support that surface

## 2. Prerequisites

Before launching the workflow, confirm the consumer repository has:

- A GitHub issue that anchors evidence, approval, and repository delivery. The issue number is required; the issue repository is taken from the `GITHUB_REPOSITORY` environment variable of the consumer repository that launched the workflow, and must not be inferred from the subject, authoritative sources, or destination.
- A defined publishing surface matching `brief.destination`. For this guide that surface is a repository file at `docs/documentation-agency-current-review.md` on a separate branch via a pull request — not a direct write to main.
- A workflow context where the documentation-lead agent and all 10 capabilities are available: `define-documentation-brief`, `collect-documentation-evidence`, `design-documentation-set`, `documentation-draft`, `test-documentation-examples`, `verify-documentation-accuracy`, `review-documentation-quality`, `revise-documentation`, `publish-documentation`, and `verify-published-documentation`.
- A human reviewer authorized to approve the publish step. Without that approval the publish step returns `blocked` and the workflow cannot complete.

## 3. Required inputs

The workflow input has two fields:

- `issue` — integer, minimum 1. The GitHub issue used as the evidence, approval, and repository-delivery anchor.
- `brief` — object with exactly six non-empty fields and no additional properties:
  - `subject` — what the document is about
  - `audience` — who the document is for
  - `desiredOutcome` — what the reader can do after reading
  - `documentType` — the kind of document to produce
  - `authoritativeSources` — array, at least one entry; sources the agent will inspect
  - `destination` — the publishing surface the deliverable will land on

Example input object for this guide:

```json
{
  "issue": 3937,
  "brief": {
    "subject": "The Kody documentation agency defined in the company Store",
    "audience": "Repository maintainers and operators who request, review, and publish documentation",
    "desiredOutcome": "Readers can provide inputs, run the creation workflow, review corrections, and approve publication safely",
    "documentType": "Practical usage guide",
    "authoritativeSources": [
      "https://github.com/aharonyaircohen/kody-company-store/tree/main/catalog/workflows/documentation-agency",
      "https://github.com/aharonyaircohen/kody-company-store/tree/main/catalog/capabilities",
      "https://github.com/aharonyaircohen/kody-company-store/blob/main/agents/documentation-lead.md",
      "Active Kody Engine workflow and capability definitions"
    ],
    "destination": "Repository proposal at docs/documentation-agency-current-review.md; create a branch and pull request for human review only; do not merge"
  }
}
```

Practical guidance before submitting:

- Make the first `authoritativeSource` the workflow definition itself when you want the deliverable to match current workflow behavior.
- For repository files, write `destination` to name a single file or surface and state the review model (separate branch, pull request, no merge, no direct write to main) so the publish step does not have to infer it.

## 4. Workflow steps

The workflow has 10 ordered steps. Every step targets `issue`. Each step calls a single capability that returns a status; the workflow graph uses that status to choose the next step.

| # | Step | Capability | Reason |
|---|------|------------|--------|
| 1 | brief | define-documentation-brief | Define the audience, reader outcome, scope, and acceptance criteria. |
| 2 | evidence | collect-documentation-evidence | Build a source-backed fact and unknowns ledger. |
| 3 | design | design-documentation-set | Design the smallest complete document set and navigation. |
| 4 | draft | documentation-draft | Write a complete evidence-backed documentation draft. |
| 5 | examples | test-documentation-examples | Safely test commands, samples, and reader procedures. |
| 6 | accuracy | verify-documentation-accuracy | Trace material claims to current source evidence. |
| 7 | quality | review-documentation-quality | Independently verify clarity, completeness, and reader success. |
| 8 | revise | revise-documentation | Apply only verified findings and return the full revised document. |
| 9 | publish | publish-documentation | After explicit approval, create or update the selected publishing surface. |
| 10 | verify-published | verify-published-documentation | Verify the actual published result rather than only the write operation. |

Routing on `pass`:

- `draft` → `examples`
- `examples` → `accuracy`
- `accuracy` → `quality`
- `quality` → `publish`
- `publish` → `verify-published`
- `verify-published` is terminal (no `next` step)

Routing on `changed`:

- `draft`, `examples`, `accuracy`, and `quality` all route to `revise`
- `revise` defaults to `examples` so corrections cycle back into testing
- `publish` passes to `verify-published`; non-pass outcomes route to `$end` by default and do not silently continue
- `evidence` → `design` is unconditional in the workflow graph; the capability does not declare its own iteration budget for this hop

Iteration budgets (maximum iterations before the workflow surfaces a non-advancing outcome for human review):

- `draft` changed → `revise`: 1
- `examples` changed → `revise`: 3
- `accuracy` changed → `revise`: 3
- `quality` changed → `revise`: 3
- `revise` default → `examples`: 2

## 5. Step outputs

These are the outputs a reader should expect from each step based on the supplied evidence. The exact schemas may evolve with the capability definitions; rely on the active runtime contract for the precise shape.

- `brief` — a structured brief that fixes audience, outcome, scope, and acceptance criteria for the rest of the pipeline.
- `evidence` — a fact-and-unknowns ledger with at least the fields `version`, `status` (`pass` / `blocked`), `summary`, `sources`, `verified_facts`, and `unknowns`. The capability inspects every source declared by `brief.authoritativeSources` plus relevant source, tests, configuration, existing documentation, and public interfaces. It returns `blocked` only when missing evidence prevents responsible documentation.
- `design` — the smallest complete document set and the navigation that connects it.
- `draft` — the complete evidence-backed Markdown draft. This is the canonical `document` for every later step.
- `examples` — the same draft annotated with tested commands, samples, and reader procedures, or `changed` if examples need revision.
- `accuracy` — material claims traced to current source evidence, or `changed` if a trace fails.
- `quality` — an independent assessment of clarity, completeness, and reader success, or `changed` if the draft is not yet ready.
- `revise` — the full revised document, applying only verified findings. The step returns the entire draft, not a patch.
- `publish` — the surface state after the change, or `blocked` if explicit human approval is not present. For repository files the step returns `changed` and does not commit or push; the workflow delivery wrapper owns the branch, commit, push, and pull request.
- `verify-published` — the outcome of verifying the actual published result, not the write operation. The step returns `blocked` if the surface is unreachable and `fail` if it is reachable but incorrect.

## 6. Review and approval

Human review is the explicit control point in the pipeline.

- The `publish` step must see explicit human approval. Without approval the step returns `blocked` and the workflow cannot complete. Approval is a human signal on the issue or through the operator's existing Kody review surface.
- Corrections are produced earlier in the pipeline. The `accuracy` and `quality` steps each independently flag material claims, clarity, completeness, and reader success. The `revise` step applies only verified findings and returns the full revised document, not a partial patch. The draft then re-enters the loop at `examples`.
- Publication happens on a pull request. The `publish` step does not commit or push; the workflow delivery wrapper owns the branch, the commit, the push, and the pull request. For this guide the wrapper creates or updates `docs/documentation-agency-current-review.md` on a separate branch and opens a pull request for human review. The workflow does not merge the pull request and does not write directly to main.
- The `verify-published` step closes the loop. It invokes an independent documentation reviewer and checks the actual published result, not whether a write or commit succeeded. A green write with a broken rendered surface returns `fail`.

## 7. Failure handling

The pipeline surfaces failure in three shapes:

- `blocked` — the step cannot proceed responsibly. Examples: `collect-documentation-evidence` returns `blocked` when missing evidence prevents responsible documentation; `publish-documentation` returns `blocked` without explicit human approval; `verify-published-documentation` returns `blocked` when the publishing surface is unreachable.
- `changed` — the step produced a result that needs revision. `draft`, `examples`, `accuracy`, and `quality` all use `changed` to route to `revise`. Each of these routes has its own iteration budget; when the budget is exhausted the workflow surfaces the non-advancing outcome for human review.
- Iteration exhaustion — the `revise` step itself loops to `examples` by default with a maximum of 2 loops. Once that budget is used, the workflow surfaces the non-advancing result rather than continuing silently.

Practical operator guidance:

- Treat `blocked` outcomes as a request for new evidence or a missing approval signal, not as a content problem.
- Treat `changed` outcomes as a normal step in the pipeline; expect `revise` to cycle the draft back to `examples`.
- Treat a `verify-published` `fail` as a real defect on the surface even if the write appeared to succeed.

## 8. Known limits

The following are honest limits based on the evidence supplied. They are not gaps in the document — they are what the evidence does and does not support.

- No Chat routing. The Documentation Agency workflow, the documentation-lead agent, and all 10 capability files contain no reference to Chat routing. This guide does not claim any Chat routing behavior. Treat any request for a Chat routing surface as out of scope until a future capability release explicitly supports it.
- Evidence → design hop has no declared iteration budget. The workflow graph moves from `evidence` to `design` unconditionally, and the `collect-documentation-evidence` capability does not declare its own iteration budget for this hop.
- Input schema divergence. The local definitions copy of the workflow omits the `inputSchema` block; the Store version and the active runtime copy include a matching `inputSchema` for `issue` and `brief`. Treat the Store and active runtime schema as the current input contract and flag the definitions-copy divergence to the maintainer responsible for syncing the workflow definitions.
- Manifest pins are not a freshness signal. The manifest SHA-256 pins for the workflow, the agent, and `collect-documentation-evidence` differ from the on-disk file hashes, even though the on-disk files are byte-identical to the Store main versions. Do not rely on the manifest to judge whether a definition is up to date; inspect the on-disk files and the Store directly.
- CMS coverage. The `publish-documentation` capability describes an existing CMS adapter or repository file surface selected by the request; the supplied evidence does not enumerate supported CMS platforms. This guide treats the abstraction, not a specific vendor list.
- No new limits for the agent beyond the workflow's iteration budgets. The documentation-lead agent file only states a qualitative hard rule (correctness over polish) and does not declare numeric limits such as document length or timeouts.

## 9. Verified facts vs. recommendations

Verified behavior (traceable to supplied evidence):

- Workflow name `Documentation Agency`, agent `documentation-lead`, ten ordered capabilities, target `issue` on every step, publish delivery `pull-request`, and the routing and iteration budgets above.
- The `issue` repository is resolved from the `GITHUB_REPOSITORY` environment variable of the consumer repository and must not be inferred from `subject`, `authoritativeSources`, or `destination`.
- Publish requires explicit human approval; the step does not commit or push; the workflow delivery wrapper owns the branch, commit, push, and pull request.
- `verify-published` checks the actual published result, not the write operation; it returns `blocked` on an unreachable surface and `fail` on a reachable-but-incorrect surface.
- `collect-documentation-evidence` is read-only and returns a fact-and-unknowns ledger; it returns `blocked` only when missing evidence prevents responsible documentation.

Operator recommendations (not workflow behavior):

- Keep `brief.authoritativeSources` minimal and authoritative. Each source is a place the agent will read; a tight list keeps the evidence step focused.
- For repository files, name a single file or surface in `destination` and state the review model (separate branch, pull request, no merge, no direct write to main) so the publish step does not have to infer it.
- Plan the review capacity. Iteration budgets are small (1, 3, 3, 3, 2); a draft that needs more than the budgeted cycles will surface for human review rather than continuing silently.
- Treat `unknowns` in the evidence ledger as input to your next brief, not as defects. The agency surfaces them so the next run can resolve them.

## Evidence references

- `catalog/workflows/documentation-agency/workflow.json` (Store) — workflow name, agent, `inputSchema`, ten ordered steps, reasons, routes, iteration budgets, pull-request delivery.
- `agents/documentation-lead.md` (Store) — agent identity and the correctness-over-polish hard rule.
- `catalog/capabilities/define-documentation-brief/instructions.md` (Store) — `GITHUB_REPOSITORY` issue-resolution rule.
- `catalog/capabilities/collect-documentation-evidence/instructions.md` and `contract.json` (Store) — read-only evidence behavior and the `version` / `status` / `summary` / `sources` / `verified_facts` / `unknowns` output contract.
- `catalog/capabilities/publish-documentation/instructions.md` (Store) — explicit human approval and workflow delivery wrapper ownership of branch, commit, push, and pull request.
- `catalog/capabilities/verify-published-documentation/instructions.md` (Store) — actual-published-result verification and `blocked` / `fail` outcomes.
- GitHub issue 3937 — the business brief, review constraints, and the explicit approval to create or update the destination on a separate branch and open a pull request for human review, without merge or direct write to main.
- `.kody-engine/definitions/capabilities/` (local) — the ten hydrated capability folders used by the workflow.
