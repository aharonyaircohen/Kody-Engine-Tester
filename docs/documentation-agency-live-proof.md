# Documentation Agency: Live Wiring Proof

## 1. What this document is and who it is for

This document is a peer-to-peer verification aid for maintainers of the `Kody-Engine-Tester` repository who already know what the Kody Engine is but have not read the hydrated Documentation Agency Store definitions. It walks the wiring of the agency as the definitions currently describe it, cites each claim as a path plus line range, and stops at the boundary between what the files on disk actually say and what would require reading engine internals to confirm. Every cited path is either committed in HEAD or present on disk at authoring time.

## 2. Who owns this — documentation-lead and the division of labour

The accountable editor is `documentation-lead`, identified at `.kody-engine/definitions/agents/documentation-lead.md` lines 8-9 as "the accountable editor for technical documentation produced by a small specialist team." The same file at lines 19-20 carries the division-of-labour sentence: "researchers gather facts, writers shape the narrative, reviewers challenge quality, and you make the final decision."

The three specialist roles routed through that lead are documented as per-capability subagent files under each capability's `tools/agents/` directory; the working-tree listing of `.kody-engine/definitions/agents/` contains only `documentation-lead.md` and `kody.md`:

- `documentation-researcher.md` is referenced by the capabilities `define-documentation-brief` (`.kody-engine/definitions/capabilities/define-documentation-brief/tools/agents/documentation-researcher.md`), `collect-documentation-evidence` (`.kody-engine/definitions/capabilities/collect-documentation-evidence/tools/agents/documentation-researcher.md`), `documentation-draft` (`.kody-engine/definitions/capabilities/documentation-draft/tools/agents/documentation-researcher.md`), and `detect-documentation-drift` (`.kody-engine/definitions/capabilities/detect-documentation-drift/tools/agents/documentation-researcher.md`).
- `documentation-writer.md` is referenced by `design-documentation-set` (`.kody-engine/definitions/capabilities/design-documentation-set/tools/agents/documentation-writer.md`), `documentation-draft` (`.kody-engine/definitions/capabilities/documentation-draft/tools/agents/documentation-writer.md`), and `revise-documentation` (`.kody-engine/definitions/capabilities/revise-documentation/tools/agents/documentation-writer.md`).
- `documentation-reviewer.md` is referenced by `documentation-draft` (`.kody-engine/definitions/capabilities/documentation-draft/tools/agents/documentation-reviewer.md`), `test-documentation-examples` (`.kody-engine/definitions/capabilities/test-documentation-examples/tools/agents/documentation-reviewer.md`), `verify-documentation-accuracy` (`.kody-engine/definitions/capabilities/verify-documentation-accuracy/tools/agents/documentation-reviewer.md`), `review-documentation-quality` (`.kody-engine/definitions/capabilities/review-documentation-quality/tools/agents/documentation-reviewer.md`), and `verify-published-documentation` (`.kody-engine/definitions/capabilities/verify-published-documentation/tools/agents/documentation-reviewer.md`).
- `publish-documentation` has no `tools/agents/` subagent on disk and is executed by the lead directly.

The `activeAgents` block of `kody.config.json` (lines 74-78) lists only `kody`, `memory-steward`, and `documentation-lead`; the three specialist roles are not registered there, only referenced from each capability's `tools/agents/` directory as set out above.

## 3. The 10-step creation pipeline with maxIterations

The creation pipeline is the workflow `documentation-agency`, defined at `.kody-engine/definitions/workflows/documentation-agency/workflow.json` (name "Documentation Agency" at L2, agent "documentation-lead" at L3). The capabilities array at L4-15 lists exactly ten entries in this order: `define-documentation-brief`, `collect-documentation-evidence`, `design-documentation-set`, `documentation-draft`, `test-documentation-examples`, `verify-documentation-accuracy`, `review-documentation-quality`, `revise-documentation`, `publish-documentation`, `verify-published-documentation`. The step graph mirrors that order: step ids `brief` (L19), `evidence` (L30), `design` (L41), `draft` (L52), `examples` (L63), `accuracy` (L88), `quality` (L113), `revise` (L138), `publish` (L151), `verify-published` (L170). `startAt` is `"brief"` at L175.

The ten capabilities are summarised below in pipeline order:

- `define-documentation-brief` (step `brief`) opens the pipeline by turning a request into a brief, owned by `documentation-researcher`.
- `collect-documentation-evidence` (step `evidence`) gathers path-verified facts, owned by `documentation-researcher`.
- `design-documentation-set` (step `design`) decides document structure, owned by `documentation-writer`.
- `documentation-draft` (step `draft`) writes the Markdown body, jointly owned by `documentation-researcher` and `documentation-writer` and reviewed by `documentation-reviewer`.
- `test-documentation-examples` (step `examples`) checks that concrete examples in the draft actually work, owned by `documentation-reviewer`.
- `verify-documentation-accuracy` (step `accuracy`) cross-checks claims against cited paths, owned by `documentation-reviewer`.
- `review-documentation-quality` (step `quality`) challenges voice, structure, and limits, owned by `documentation-reviewer`.
- `revise-documentation` (step `revise`) folds review feedback back into the draft, owned by `documentation-writer`.
- `publish-documentation` (step `publish`) is executed by the lead directly because no `tools/agents/` subagent exists for it on disk.
- `verify-published-documentation` (step `verify-published`) checks the publication record, owned by `documentation-reviewer`.

The four `maxIterations` values declared in `workflow.json` are exactly:

| Edge | Direction | Value |
|---|---|---|
| L78 | `examples` -> `revise` | 3 |
| L103 | `accuracy` -> `revise` | 3 |
| L128 | `quality` -> `revise` | 3 |
| L145 | `revise` -> `examples` | 9 |

The JSON value is cited; the semantics of how the engine counts those iterations are out of scope and named as unknown in section 10.

Beyond the four workflow-level `maxIterations` edges above, `.kody-engine/definitions/capabilities/documentation-draft/instructions.md` lines 13-15 document a separate single in-capability revision round inside `documentation-draft`: when the reviewer reports material problems, `documentation-writer` is invoked once more with the review notes, and `documentation-reviewer` is then invoked once more on the revision. That round is one further writer invocation followed by one further reviewer invocation, distinct from the workflow-level `maxIterations` budgets in the table and not constrained by a numeric counter.

## 4. Why detect-documentation-drift is not in this pipeline

`detect-documentation-drift` is not a step of `documentation-agency`; a grep of `.kody-engine/definitions/workflows/documentation-agency/workflow.json` returns no matches. It is the sole capability of the separate workflow `maintain-documentation`, defined at `.kody-engine/definitions/workflows/maintain-documentation/workflow.json` (agent "documentation-lead" at L3, capabilities `["detect-documentation-drift"]` at L4-6, single step id `detect-drift` with `input.mode "repository-documentation-maintenance"` at L8-15, `startAt "detect-drift"` at L17). The capability itself is read-only: `.kody-engine/definitions/capabilities/detect-documentation-drift/instructions.md` L8 states "Do not rewrite, publish, delete, commit, or silently change documentation." The maintenance sweep therefore never advances into the creation pipeline.

## 5. The weekly maintenance loop

The maintenance cadence is declared at `.kody-engine/definitions/loops/documentation-maintenance/loop.json`: id `documentation-maintenance` (L2); trigger type `schedule` with `every "7d"` (L3-6); target `{kind: "workflow", id: "maintain-documentation"}` (L7-10); `input.mode "repository-documentation-maintenance"` (L11-13); `enabled true` (L14). That file is tracked in git HEAD, which makes it the committed exception among the cited definitions. The cadence is a weekly interval expressed as `"7d"`, not a cron expression. The loop is registered by definition; the scheduler has not been observed to have executed it — `manifest.json` contains no `loop:` entries and no scheduler state was located — and the document does not claim any execution has happened.

## 6. When publication is blocked

`.kody-engine/definitions/capabilities/publish-documentation/instructions.md` lines 6-18 specify the approval rule: explicit human approval must be present, unambiguous, and not older than the reviewed revision; when any of those conditions fails, the capability returns the JSON payload

```
{
  "status": "blocked",
  "location": "",
  "change_record": "",
  "summary": "Explicit human approval is required before publication."
}
```

The same file at L20-23 forbids deleting documents, overwriting unrelated content, and creating a parallel publishing store, and requires preserving the selected system's normal permissions, history, and transport. The contract at `.kody-engine/definitions/capabilities/publish-documentation/contract.json` L25-29 fixes the output `status` enum to exactly `"published"`, `"proposed"`, `"blocked"`, and L41-47 requires `status`, `location`, `change_record`, and `summary` with `additionalProperties: false`.

## 7. Repository "proposed" branch vs CMS "published" branch

`.kody-engine/definitions/capabilities/publish-documentation/instructions.md` lines 25-30 describe two branches from the `publish-documentation` step:

- The repository branch: edits to repository files return `"proposed"`; the workflow delivery wrapper at `.kody-engine/definitions/workflows/documentation-agency/workflow.json` L153 (`"delivery": "pull-request"`) owns the branch, the commit, the push, and the pull request, and the pull request is the change record that still needs merge approval.
- The CMS branch: returns `"published"` together with a canonical location and a durable change identifier.

This repository configures a Payload CMS instance for application data at `src/payload.config.ts` in HEAD; that configuration is not in scope here. For the `publish-documentation` capability, however, no CMS adapter is wired as a documentation publication surface, and no prior CMS documentation publication was located. Therefore only the repository path of publish-documentation is reachable here (the conditional path inside the publish-documentation capability — not a git branch and not the application stack). The CMS branch is described only as the conditional alternative spelled out by the capability.

## 8. Operator example: issue #3935 through the agency

GitHub issue #3935 is open and requests a create-or-update of only `docs/documentation-agency-live-proof.md`, grants explicit human approval for the final independently reviewed revision to be delivered via the normal pull-request delivery wrapper, disallows a direct commit to `main`, and disallows deletion. The pipeline enters at step `brief` (`workflow.json` L175); the `collect-documentation-evidence` (L31), `design-documentation-set` (L42), and `documentation-draft` (L53) steps each declare `target: "issue"`. The `examples`, `accuracy`, and `quality` edges iterate into `revise` under their `maxIterations` caps from section 3; `publish-documentation` returns `"proposed"` and the delivery wrapper opens a pull request whose merge approval is still pending. Because the workflow's `publish` step advances to `verify-published` only when `result.status == "published"` (`workflow.json` L155-166), the proposed path follows the default branch at L162-164 to `$end` and `verify-published-documentation` does not run on the pull-request change record from this repository. Whether skipping verify-published on the repository delivery path is intentional is left open in section 10. No command line is supplied because none is defined in the cited paths.

## 9. What is hydrated Store state vs what is in git HEAD

The cited definition paths other than the loop are hydrated Store state: `agents/documentation-lead.md`, `workflows/documentation-agency/workflow.json`, `workflows/maintain-documentation/workflow.json`, and the cited capability files are present on disk at authoring time but absent from git HEAD. The single committed exception is `.kody-engine/definitions/loops/documentation-maintenance/loop.json`, which is tracked. `manifest.json` records the hydration timestamp at L4 (`hydratedAt: "2026-07-30T11:08:58.885Z"`) and is itself a flat versions map keyed by `kind:id` to sha256; it lists (among other entries) `agent:documentation-lead`, the eleven documentation capabilities (the ten creation capabilities of section 3 plus detect-documentation-drift), and the two documentation workflows plus `asset:company-store-shared`, with no `loop:` entries; the versions map also contains unrelated agents, capabilities, and workflows not enumerated here. `kody.config.json` activates `documentation-lead` in `activeAgents` (lines 74-78), the eleven documentation capabilities — the ten creation capabilities of section 3 plus detect-documentation-drift — in `activeCapabilities` (lines 92-102), and the two documentation workflows in `activeWorkflows` (lines 109-110); the three specialist roles are not registered in `activeAgents` and live only under each capability's `tools/agents/` directory as set out in section 2, and the legacy `documentation-maintenance` capability present in HEAD is not listed in `activeCapabilities`. The `docs/` directory contains `CONFLICT_TEST.md`, `RESOLVE_TEST_1776631230.md`, `stack-v9.md`, `stack-v10.md`, `stack-v11.md`, `stack-v12.md`, and `test-prd.md` in both the working tree and HEAD; `docs/documentation-agency-live-proof.md` exists in neither, so this document is a CREATE.

## 10. What we deliberately did not claim

The following points are unknown from the cited paths and are stated as unknown rather than filled in:

- The implementation of the `"delivery": "pull-request"` wrapper at `workflow.json` L153 — branch naming, commit author, PR template, merge mechanics — is not in this repository and is not asserted here.
- Whether the `"7d"` schedule trigger has ever been dispatched, when it last ran, and what execution record exists: `manifest.json` contains no loop entries and no scheduler state was located.
- The semantics of `maxIterations` — whether it counts per edge, whether the cap includes the first attempt or only retries, and how it is reset — is not determinable from `workflow.json` alone; only the JSON values are cited.
- Whether `publish-documentation` terminating at `$end` on status `"proposed"` (`workflow.json` L163) instead of advancing to `verify-published` is intentional: `workflow.json` and `instructions.md` agree on naming but do not state whether repository delivery should reach `verify-published`, so this is flagged honestly rather than resolved.
- No CMS adapter is wired to `publish-documentation` as a documentation publication surface, and no prior CMS documentation publication was located in this repository (though `src/payload.config.ts` in HEAD does configure a Payload CMS instance for application data, which is not in scope here); the CMS branch in section 7 is described as the conditional alternative and nothing more.
