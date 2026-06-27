---
title: .kody/ Gitignore Convention
type: convention
updated: 2026-05-05
sources:
  - https://github.com/aharonyaircohen/Kody-Engine-Tester/pull/3174
---

## Rule

The `.kody/` directory is **partially gitignored** — runtime artifacts are excluded, but consumer-repo-controlled assets are tracked.

### Current pattern

```
# Ignore everything under .kody/
.kody/*

# But keep these subtrees tracked
!.kody/executables/
!.kody/executables/**
!.kody/missions/
!.kody/missions/**
!.kody/vault/
!.kody/vault/**
!.kody/goals/
!.kody/goals/**

# Ignore per-run output within tracked directories
.kody/executables/**/last-run.json
```

## Why

- `executables/` and `missions/` are authored by the consumer repo team and versioned like code (reviewed in PRs, historically meaningful).
- `vault/` is kody's long-term memory — pages are authored by the `memorize` executable and reviewed in PRs.
- `goals/` tracks active goal state for kody's goal system.
- `last-run.json` and other runtime state are ephemeral and must never be committed.
- Using `.kody/*` (not `.kody/`) as the ignore parent is required for the negation pattern to work — gitignore negations only override a parent ignore if the parent directory itself is not fully ignored.
