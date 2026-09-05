# Documentation Agency — AI Operating Guide

This guide is the operating contract for an AI agent executing the Kody documentation agency. Read it end-to-end before any action. Every input, action, decision condition, expected output, safety rule, and recovery path is explicit. The guide is anchored to the latest approval comment on issue #3937 and the canonical catalog repository at `aharonyaircohen/kody-ai-agency-catalog`.

## 1. Purpose and Scope

Purpose: enable an AI agent to operate the documentation agency safely and correctly — to validate required context, run the workflow, interpret every result, handle failures, and request publication without guessing.

Scope: the documentation-agency workflow defined in the Kody documentation agency (catalog/workflows/documentation-agency/workflow.json), its ten capabilities, and its lead agent. The workflow produces Markdown documents for a human reviewer and routes them via pull request.

Out of scope: merging, pushing directly to `main`, executing any capability the issue does not authorize, and inferring behavior not covered by verified facts.

## 2. Source Priority

Resolve sources in this order. Never substitute a lower-priority source when a higher-priority one answers the question.

1. Canonical catalog repository: `aharonyaircohen/kody-ai-agency-catalog` — paths such as `catalog/workflows/documentation-agency/workflow.json`, `catalog/capabilities/*/contract.json`, `catalog/agents/documentation-lead.md`.
2. Local mirrors under `.kody-engine/definitions/...` in the active Kody Engine workflow.
3. Issue #3937 on `aharonyaircohen/Kody-Engine-Tester` for the latest approval comment and run authorization.

Unresolved alias: the brief uses `kody-company-store` URLs. The evidence resolves those URLs to `aharonyaircohen/kody-ai-agency-catalog`. Treat `kody-company-store` as an unresolved alias and always cite the canonical repository.

## 3. Required Inputs

Validate every input before invoking the first capability. Reject the run if any required input is missing.

- `issue` — the review issue number (integer). For this run: `3937`.
- `brief` — an object with exactly these keys:
  - `subject` — the topic of the documentation.
  - `audience` — who reads the document.
  - `desiredOutcome` — what success looks like.
  - `documentType` — type of deliverable (e.g., AI operating guide).
  - `authoritativeSources` — list of source paths or identifiers.
  - `destination` — target file path inside the repository. For this run: `docs/documentation-agency-ai-guide.md`.

The workflow input schema requires the `issue` integer and the brief object above.

## 4. Available Actions

The documentation-agency workflow owns exactly ten capabilities. The AI agent reading this guide is the operator invoking each capability under the authority of the `documentation-lead` agent identity; `documentation-lead` defines the hard rule and routing authority that apply, while this guide executes the workflow.

Initial execution order (the order the agent runs them on a fresh run):

1. `define-documentation-brief`
2. `collect-documentation-evidence`
3. `design-documentation-set`
4. `documentation-draft`
5. `test-documentation-examples`
6. `verify-documentation-accuracy`
7. `review-documentation-quality`
8. `revise-documentation`
9. `publish-documentation`
10. `verify-published-documentation`

On the initial pass, run them in this order; do not skip, reorder, or add capabilities. Section 6 defines conditional routing that may loop back to an earlier step (notably `revise-documentation` returning to `test-documentation-examples`); that is documented routing, not reordering, and is required by the workflow definition.

Owner: `documentation-lead`.

## 5. Decision Rules

Apply these rules before every transition. They override any conflicting default.

- Hard rule (documentation-lead): never trade correctness for polish. If a draft is correct but unpolished, do not invent polish. If a draft is polished but not correct, reject the polish.
- Iteration cap A: the transition from `review-documentation-quality` to `revise-documentation` has `maxIterations: 3`. After three revisions routed from quality, the agent must stop and escalate (see Section 8).
- Iteration cap B: the transition from `revise-documentation` to `test-documentation-examples` has `maxIterations: 3`. After three revise-to-examples cycles, the agent must stop and escalate.
- Explicit-human-approval gate: do not invoke `publish-documentation` without an explicit, unambiguous, non-stale human approval comment on issue #3937. The originating issue for this run is issue #3937.

## 6. Ordered Procedure

Run the capabilities in the order and conditions below. The routing matrix is reproduced verbatim from the workflow definition. The `#` column is unique per row; sub-numbers (e.g., 7a, 7b; 9a, 9b) denote conditional branches of the same capability.

| # | Capability | Condition on prior result.status | Next capability | Terminal |
|---|------------|-----------------------------------|-----------------|----------|
| 1 | `define-documentation-brief` | unconditional (with `blocked` halting per Section 9) | `collect-documentation-evidence` | no |
| 2 | `collect-documentation-evidence` | unconditional (with `blocked` halting per Section 9) | `design-documentation-set` | no |
| 3 | `design-documentation-set` | unconditional (with `blocked` halting per Section 9) | `documentation-draft` | no |
| 4 | `documentation-draft` | `pass` | `test-documentation-examples` | no |
| 5 | `test-documentation-examples` | `pass` or `changed` | `verify-documentation-accuracy` | no |
| 6 | `verify-documentation-accuracy` | `pass` or `changed` | `review-documentation-quality` | no |
| 7a | `review-documentation-quality` | `pass` | `publish-documentation` | no |
| 7b | `review-documentation-quality` | `changed` (maxIterations: 3) | `revise-documentation` | no |
| 8 | `revise-documentation` | default (maxIterations: 3) | `test-documentation-examples` | no |
| 9a | `publish-documentation` | `pass` | `verify-published-documentation` | no |
| 9b | `publish-documentation` | not `pass` | `$end` | yes |
| 10 | `verify-published-documentation` | unconditional | `$end` | yes |

Execution is unconditional through rows 1–3 for `pass` results: no status-keyed branching defines a different next capability, but a `blocked` result still halts the run per Section 9. Conditional routing begins at row 4. The two `maxIterations: 3` caps apply as stated. Rows 4, 5, 6, and 7 define only status-keyed transitions without a default or `$end` rule; behavior when none of the defined conditions match is unspecified and recorded in Known Unknowns.

## 7. Expected Outputs

Each capability returns an output object with the listed keys. Validate key presence — including `version`, `summary`, and `status` — before proceeding. Every capability's output object MUST carry `version: 1` (constant); reject any output where `version` is absent or not `1`.

- `define-documentation-brief` — keys: `version`, `audience`, `purpose`, `scope`, `acceptance_criteria`, `source_evidence`, `summary`, `status` (`pass`, `blocked`).
- `collect-documentation-evidence` — keys: `version`, `sources`, `verified_facts`, `unknowns`, `summary`, `status` (`pass`, `blocked`).
- `design-documentation-set` — keys: `version`, `documents`, `navigation`, `rationale`, `summary`, `status` (`pass`, `blocked`).
- `documentation-draft` — keys: `version`, `title`, `document`, `source_evidence`, `review_notes`, `summary`, `status` (`pass`, `blocked`).
- `test-documentation-examples` — keys: `version`, `tests`, `failures`, `source_evidence`, `summary`, `status` (`pass`, `changed`, `blocked`).
- `verify-documentation-accuracy` — keys: `version`, `findings`, `source_evidence`, `summary`, `status` (`pass`, `changed`, `blocked`).
- `review-documentation-quality` — keys: `version`, `findings`, `summary`, `status` (`pass`, `changed`, `blocked`).
- `revise-documentation` — keys: `version`, `document`, `source_evidence`, `summary`, `status` (`changed`, `blocked`).
- `publish-documentation` — keys: `version`, `location`, `change_record`, `summary`, `status` (`pass`, `changed`, `blocked`).
- `verify-published-documentation` — keys: `version`, `location`, `checks`, `summary`, `status` (`pass`, `fail`, `blocked`).

## 8. Safety Limits

- Explicit-human-approval gate: never invoke `publish-documentation` without a current, explicit, non-stale approval comment on issue #3937.
  - **Non-stale criterion**: the approval comment must be the most recent comment on issue #3937 that authorizes publication of `docs/documentation-agency-ai-guide.md`, and no comment posted after it has revoked, superseded, or amended that authorization. If a more recent comment contradicts or withdraws the approval, treat the approval as stale and halt.
- No direct push to `main`. The publication channel is a pull request opened or updated for human review only. Do not merge.
- Branch isolation: the destination file lives on a branch, never directly on `main`.
- Iteration caps: respect the two `maxIterations: 3` caps. When either cap is reached, **escalate** by halting the run, posting a comment on issue #3937 that summarizes the cap-exhaustion state and any blocking findings, and waiting for explicit human direction. The engine itself does not define an escalation transition (see Known Unknowns item 1).
- Lead rule: never trade correctness for polish.
- Unknowns discipline: never invent behavior the verified facts do not establish.

## 9. Failure Handling

Statuses are scoped per capability. `blocked` means stop and escalate (per Section 8) unless the workflow's `revise-documentation` default transition applies.

- `define-documentation-brief`, `collect-documentation-evidence` — `pass`: continue. `blocked`: stop and escalate.
- `design-documentation-set`, `documentation-draft` — `pass`: continue. `blocked`: stop and escalate.
- `test-documentation-examples`, `verify-documentation-accuracy`, `review-documentation-quality` — `pass`: continue along the `pass` route. `changed`: continue along the `changed` route. `blocked`: stop and escalate.
- `revise-documentation` — the step's single default transition routes to `test-documentation-examples` (cap: 3) regardless of the prior status (`changed` or `blocked`). Behavior after the cap is exhausted is unspecified (see Known Unknowns).
- `publish-documentation` — `pass`: continue to `verify-published-documentation`. `changed`: stop at `$end`. `blocked`: route to `$end` and escalate by halting the run and surfacing the blocker via a comment on issue #3937; do not treat the workflow's `$end` route as permission to continue or publish.
- `verify-published-documentation` — `pass`: end successfully. `fail`: report failure, stop. `blocked`: stop and escalate.

Whenever a `blocked` status is observed, halt the run, surface the blocker to the human reviewer via a comment on issue #3937, and request direction, except at `revise-documentation`, where the workflow's default transition routes to `test-documentation-examples` subject to the iteration cap.

## 10. Publication Protocol

Publication uses pull-request delivery. The agent must not merge and must not push to `main`.

1. Verify the destination path is exactly `docs/documentation-agency-ai-guide.md`. Do not substitute an alternative path. The latest approval comment on issue #3937 governs the destination filename; if it names any other path, halt and escalate (see Section 8).
2. Confirm an explicit, non-stale approval comment on issue #3937 authorizes creating or updating this file on a separate branch. Fetch all issue comments by requesting `GET /repos/{owner}/{repo}/issues/{issue_number}/comments?per_page=100&page=N` starting with `page=1`, then increment `N` and continue until a response contains fewer than 100 comments (also process the final non-empty page). Treat the comments as chronological because the endpoint returns them in ascending creation order; identify the most recent authorization by the latest `created_at` value, and inspect every later comment for revocation, supersession, or amendment. Verify that the selected comment contains explicit authorization language (e.g., "approve", "go ahead", "proceed", "lgtm", or equivalent), names the exact destination filename `docs/documentation-agency-ai-guide.md`, and has no subsequent comment that revokes, supersedes, or amends that authorization (see non-stale criterion in Section 8).
3. Create or update a branch named `docs/documentation-agency-ai-guide` containing only the approved changes; if a branch with that name already exists from a prior run, name the new branch `docs/documentation-agency-ai-guide-<run-suffix>` where `<run-suffix>` is a short identifier for this run (e.g., a date or run counter). Branch off from the current default branch tip (`main` or its current default).
4. Open or update a pull request from the branch to the default branch for human review.
5. Stop at the pull request. Do not merge. Do not push to `main`.
6. Hand the pull request URL to the human reviewer via a comment on issue #3937 and end the run.

The latest approval comment on issue #3937 governs the destination. Earlier review framing that referenced `docs/documentation-agency-current-review.md` is superseded.

## 11. Known Unknowns

The AI must NOT guess on any of the following. Record them explicitly in the run output.

1. The workflow definitions do not specify a transition or final status after either `maxIterations: 3` cap is exhausted.
2. Whether the earlier `docs/documentation-agency-current-review.md` approval remains applicable to the newer AI-guide filename beyond the latest comment's explicit authorization.
3. The identity of the human reviewer, the required approval count, and the merge authority for the eventual pull request.
4. Whether `kody-company-store` is a typo, redirect, or intentional rename of `kody-ai-agency-catalog`. Only the canonical repository's accessible content is verified.
5. The exact engine interpretation of the explicit-human-approval gate that `publish-documentation` requires; the workflow routes publish on `result.status === pass` but does not independently specify the approval transition.
6. Chat routing behavior — no evidence establishes how Chat invokes or routes this workflow.
7. Whether repository-level services or other notes add human-approval or scope requirements beyond the inspected workflow and capability contracts.
8. The workflow definitions for `documentation-draft`, `test-documentation-examples`, `verify-documentation-accuracy`, and `review-documentation-quality` define conditional next transitions only for specific `result.status` values. No default rule and no `$end` transition is defined for these steps; behavior when none of the defined conditions match is unspecified.

## Appendix A: Capability Input/Output Contract Table

| # | Capability | Required inputs | Output contract keys | Valid statuses |
|---|------------|-----------------|----------------------|----------------|
| 1 | `define-documentation-brief` | `issue`, `brief` | `version`, `audience`, `purpose`, `scope`, `acceptance_criteria`, `source_evidence`, `summary`, `status` | `pass`, `blocked` |
| 2 | `collect-documentation-evidence` | prior brief output | `version`, `sources`, `verified_facts`, `unknowns`, `summary`, `status` | `pass`, `blocked` |
| 3 | `design-documentation-set` | prior evidence output | `version`, `documents`, `navigation`, `rationale`, `summary`, `status` | `pass`, `blocked` |
| 4 | `documentation-draft` | prior design output | `version`, `title`, `document`, `source_evidence`, `review_notes`, `summary`, `status` | `pass`, `blocked` |
| 5 | `test-documentation-examples` | prior draft output | `version`, `tests`, `failures`, `source_evidence`, `summary`, `status` | `pass`, `changed`, `blocked` |
| 6 | `verify-documentation-accuracy` | prior examples output | `version`, `findings`, `source_evidence`, `summary`, `status` | `pass`, `changed`, `blocked` |
| 7 | `review-documentation-quality` | prior accuracy output | `version`, `findings`, `summary`, `status` | `pass`, `changed`, `blocked` |
| 8 | `revise-documentation` | prior quality output (changed) | `version`, `document`, `source_evidence`, `summary`, `status` | `changed`, `blocked` |
| 9 | `publish-documentation` | prior pass output + explicit human approval on issue #3937 | `version`, `location`, `change_record`, `summary`, `status` | `pass`, `changed`, `blocked` |
| 10 | `verify-published-documentation` | prior publish output | `version`, `location`, `checks`, `summary`, `status` | `pass`, `fail`, `blocked` |

Every capability's output object MUST carry `version: 1` (constant).

## Appendix B: Routing Matrix

| Transition | Condition | Next capability | Terminal |
|------------|-----------|-----------------|----------|
| `define-documentation-brief` → next | unconditional (with `blocked` halting per Section 9) | `collect-documentation-evidence` | no |
| `collect-documentation-evidence` → next | unconditional (with `blocked` halting per Section 9) | `design-documentation-set` | no |
| `design-documentation-set` → next | unconditional (with `blocked` halting per Section 9) | `documentation-draft` | no |
| `documentation-draft` → next | `result.status === pass` | `test-documentation-examples` | no |
| `test-documentation-examples` → next | `pass` or `changed` | `verify-documentation-accuracy` | no |
| `verify-documentation-accuracy` → next | `pass` or `changed` | `review-documentation-quality` | no |
| `review-documentation-quality` → next | `pass` | `publish-documentation` | no |
| `review-documentation-quality` → next | `changed` (maxIterations: 3) | `revise-documentation` | no |
| `revise-documentation` → next | default (maxIterations: 3) | `test-documentation-examples` | no |
| `publish-documentation` → next | `pass` | `verify-published-documentation` | no |
| `publish-documentation` → end | not `pass` | `$end` | yes |
| `verify-published-documentation` → end | unconditional | `$end` | yes |
