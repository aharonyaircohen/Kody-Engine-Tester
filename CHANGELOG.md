# Changelog

## v1.0.11 — 2026-05-05

### Features
- replace single-stage cases with feature.full-flow (b32ecd27)
- add plan, classify, review live cases + PR-fixture support (bba2602b)
- add live tier with fixture lifecycle + failure-issue reporting (288cedc9)
- add nightly Kody engine smoke suite as a consumer-repo executable (e2d979ef)
- seed auto-resolve mission for live test (f1c55810)
- seed auto-fix-ci mission for live test (99738842)

### Fixes
- find PR via kody-posted URL comment, not branch search (18626a87)
- bulletproof run fixture, classify assertion (c24deb79)
- assert on RUN_COMPLETED, not DONE (90d78d3d)
- calibrate cases.json against engine v0.3.40 actuals (0ff0f839)
- explicit pip install litellm before engine (9c39ab0a)
- unpack secrets and set GH_TOKEN before invoking engine (17f92f83)

### Refactoring
- drop kody-nightly-tests.yml — engine fans out from kody.yml (6fc1f3a0)

### Chores
- bump to 0.3.72 (title refresh fix) (911c2841)
- update state for auto-resolve (rev 6) (e79712d3)
- bump to 0.3.70-beta.6 (37516292)
- bump to 0.3.70-beta.5 (7ab3cf2b)
- bump to 0.3.70-beta.4 (15ff1766)
- bump to 0.3.70-beta.3 (a77eb4dd)
- pin workflow checkout to dev for refactor smoke test (529a1786)
- switch to dev/main release branching for refactor smoke test (b525f8b9)
- bump to 0.3.70-beta.2 (a5282331)
- pin kody-engine to 0.3.70-beta.1 for refactor smoke test (09890b1f)
- update state for auto-fix-ci (rev 3) (a8b7d7b2)
- update state for auto-resolve (rev 5) (06dba437)
- update state for auto-fix-ci (rev 2) (b09fae0a)
- update state for auto-resolve (rev 4) (350837fe)
- update state for auto-resolve (rev 3) (40c55f73)
- chore(vault): add PR #3063 nightly smoke suite pages (1c034d4f)
- track .kody/vault/ for kody memorize (7d2ae83f)
- update state for auto-resolve (rev 2) (649a3c30)
- update state for auto-resolve (rev 1) (ad57c9c8)
- update state for auto-fix-ci (rev 1) (474651ff)

### Other
- grant actions:read so fix-ci can fetch failed run logs (b188dabe)
## v1.0.10 — 2026-05-05

### Features
- add range helper to generate numeric sequences (cba81b53)
- add sleep helper for awaiting milliseconds (64b474fd)

### Chores
- bump to 0.3.70-beta.6 (f5a27748)
## v1.0.9 — 2026-05-05

_No notable commits since the last release._
## v1.0.8 — 2026-05-05

_No notable commits since the last release._
## v1.0.7 — 2026-05-05

_No notable commits since the last release._
## v1.0.6 — 2026-05-05

_No notable commits since the last release._
## v1.0.5 — 2026-05-05

_No notable commits since the last release._
## v1.0.4 — 2026-05-05

_No notable commits since the last release._
## v1.0.3 — 2026-04-25

_No notable commits since the last release._
## v1.0.2 — 2026-04-25

_No notable commits since the last release._
All notable changes to this project will be documented in this file.

## v1.0.1 — 2026-04-25

_No notable commits since the last release._
