---
title: .kody/ Gitignore Convention
type: convention
updated: 2026-04-27
sources:
  - https://github.com/aharonyaircohen/Kody-Engine-Tester/pull/3063
---

## Rule

The `.kody/` directory is **partially gitignored** — runtime artifacts are excluded, but consumer-repo-controlled assets are tracked.

### Current pattern

```
# Ignore everything under .kody/
.kody/*

# But keep these subtrees tracked
!.kody/agent-actions/
!.kody/agent-actions/**
!.kody/agent-responsibilities/
!.kody/agent-responsibilities/**
!.kody/agents/
!.kody/agents/**
!.kody/agent-loops/
!.kody/agent-loops/**

# Ignore per-run output within tracked directories
.kody/agent-actions/**/last-run.json
```

## Why

- `agent-actions/`, `agent-responsibilities/`, `agents/`, and `agent-loops/` are authored by the consumer repo team and versioned like code (reviewed in PRs, historically meaningful).
- `last-run.json` and other runtime state are ephemeral and must never be committed.
- Using `.kody/*` (not `.kody/`) as the ignore parent is required for the negation pattern to work — gitignore negations only override a parent ignore if the parent directory itself is not fully ignored.
