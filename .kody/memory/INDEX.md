# Kody memory index

One line per memory. The `memory-writer` job maintains this file — do not edit by hand.
To add a memory, drop a sticky note in [`inbox/`](inbox/README.md) and the job will file it.

Each entry: `- [Title](id.md) — one-line hook (type: <type>)`.

- [No bullet points](no-bullet-points.md) — Use plain prose instead of bullet points in all replies (type: feedback)

- [Phase 1 smoke test sticky note](phase1-smoke-test.md) — Verify the memory inbox accepts and files a sticky note end-to-end (type: lesson)

- [Answers must be terse](answers-must-be-terse.md) — Lead with the answer in one sentence; expand only on request. (type: preference)

- [fix-ci must not edit __snapshots__ files](fix-ci-do-not-edit-snapshot-files.md) — Editing Vitest snapshot files inside fix-ci masks real assertion failures; regenerate or update tests instead. (type: lesson)

- [Stick with Vitest; do not migrate to Jest](use-vitest-not-jest.md) — Vitest is the canonical test runner here — migration to Jest was considered and rejected. (type: decision)

- [Verdict: dismiss on CTO execute for #42](verdict-cto-42-execute-dismiss.md) — Operator dismissed the CTO execute recommendation on task #42 (by @aguyaharonyair). (type: verdict)

- [Verdict: dismiss on CEO proposal sentry-digest](verdict-ceo-proposal-sentry-digest.md) — Operator dismissed the CEO proposal to add a sentry-digest job (issue #3467). (type: verdict)
