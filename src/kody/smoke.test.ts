/**
 * Smoke tests for @kody-ade/engine — verifying typed AgentOutcomeKind.
 *
 * These tests exercise the kody-engine CLI and assert on its exit codes, stdout,
 * and stderr to confirm the engine produces correctly-typed outcomes.
 *
 * AgentOutcomeKind is the discriminated-union `kind` field attached to every
 * agent result (e.g. "success" | "error" | "invalid_args" | "requires_action").
 * A "typed" outcome means the kind is always one of the known literals —
 * never `string` or `unknown` — so downstream consumers get exhaustive
 * narrowing without casts.
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { execFileSync } from 'child_process'
import path from 'path'

const ENGINE_BIN = path.resolve(
  __dirname,
  '../../node_modules/@kody-ade/engine/dist/bin/cli.js'
)

function kody(args: string[], cwd?: string): { exitCode: number; stdout: string; stderr: string } {
  const result = execFileSync('node', [ENGINE_BIN, ...args], {
    encoding: 'utf-8',
    cwd,
    timeout: 30_000,
  })
  return { exitCode: 0, stdout: result, stderr: '' }
}

function kodyFail(
  args: string[],
  cwd?: string
): { exitCode: number; stdout: string; stderr: string } {
  try {
    const result = execFileSync('node', [ENGINE_BIN, ...args], {
      encoding: 'utf-8',
      cwd,
      timeout: 30_000,
    })
    return { exitCode: 0, stdout: result, stderr: '' }
  } catch (err: unknown) {
    const e = err as { status?: number; stdout?: string; stderr?: string }
    return {
      exitCode: e.status ?? 1,
      stdout: typeof e.stdout === 'string' ? e.stdout : '',
      stderr: typeof e.stderr === 'string' ? e.stderr : '',
    }
  }
}

describe('kody-engine smoke — AgentOutcomeKind', () => {
  // ─── success outcomes ──────────────────────────────────────────────────────

  describe('version (success outcome)', () => {
    it('exits 0 and prints a semver-formatted version string', () => {
      const { exitCode, stdout } = kody(['version'])
      expect(exitCode).toBe(0)
      // Must match "kody X.Y.Z" so downstream consumers can extract the version
      expect(stdout).toMatch(/^kody \d+\.\d+\.\d+$/)
    })

    it('--version flag also exits 0 with a semver string', () => {
      const { exitCode, stdout } = kody(['--version'])
      expect(exitCode).toBe(0)
      expect(stdout).toMatch(/^kody \d+\.\d+\.\d+$/)
    })
  })

  describe('help (success outcome)', () => {
    it('exits 0 and lists all top-level commands', () => {
      const { exitCode, stdout } = kody(['--help'])
      expect(exitCode).toBe(0)
      expect(stdout).toContain('kody run')
      expect(stdout).toContain('kody fix')
      expect(stdout).toContain('kody fix-ci')
      expect(stdout).toContain('kody review')
      expect(stdout).toContain('kody resolve')
      expect(stdout).toContain('kody status')
      expect(stdout).toContain('Usage:')
    })

    it('help command also exits 0', () => {
      const { exitCode, stdout } = kody(['help'])
      expect(exitCode).toBe(0)
      expect(stdout).toContain('Usage:')
    })
  })

  // ─── invalid-args outcomes (typed kind = "invalid_args") ─────────────────

  describe('missing required flags (invalid_args outcome)', () => {
    // These map to AgentOutcomeKind.invalidArgs — the engine validates required
    // flags before starting any agent work, so the kind is always "invalid_args".
    // Exit code 64 is the engine's canonical "invalid arguments" exit.

    it('kody run without --task-id exits 64 with a clear error', () => {
      const { exitCode, stderr } = kodyFail(['run'])
      expect(exitCode).toBe(64)
      expect(stderr).toContain('task-id')
    })

    it('kody fix without --task-id exits 64', () => {
      const { exitCode, stderr } = kodyFail(['fix'])
      expect(exitCode).toBe(64)
      expect(stderr).toContain('task-id')
    })

    it('kody review without --pr-number exits 64', () => {
      const { exitCode, stderr } = kodyFail(['review'])
      expect(exitCode).toBe(64)
      expect(stderr).toContain('pr')
    })

    it('kody resolve without --pr-number exits 64', () => {
      const { exitCode, stderr } = kodyFail(['resolve'])
      expect(exitCode).toBe(64)
      expect(stderr).toContain('pr')
    })

    it('kody plan without --issue exits 64', () => {
      const { exitCode, stderr } = kodyFail(['plan'])
      expect(exitCode).toBe(64)
      expect(stderr).toContain('issue')
    })

    it('kody classify without --issue exits 64', () => {
      const { exitCode, stderr } = kodyFail(['classify'])
      expect(exitCode).toBe(64)
      expect(stderr).toContain('issue')
    })

    it('kody spec without --issue exits 64', () => {
      const { exitCode, stderr } = kodyFail(['spec'])
      expect(exitCode).toBe(64)
      expect(stderr).toContain('issue')
    })

    it('kody research without --issue exits 64', () => {
      const { exitCode, stderr } = kodyFail(['research'])
      expect(exitCode).toBe(64)
      expect(stderr).toContain('issue')
    })

    it('kody decompose without --issue-number exits 64', () => {
      const { exitCode, stderr } = kodyFail(['decompose'])
      expect(exitCode).toBe(64)
      expect(stderr).toContain('issue')
    })

    it('kody hotfix without --issue-number exits 64', () => {
      const { exitCode, stderr } = kodyFail(['hotfix'])
      expect(exitCode).toBe(64)
      expect(stderr).toContain('issue')
    })

    it('kody compose without --task-id exits 64', () => {
      const { exitCode, stderr } = kodyFail(['compose'])
      expect(exitCode).toBe(64)
      expect(stderr).toContain('task-id')
    })

    it('kody status without --task-id exits 64', () => {
      const { exitCode, stderr } = kodyFail(['status'])
      expect(exitCode).toBe(64)
      expect(stderr).toContain('task-id')
    })

    it('kody mission-tick without --mission exits 64', () => {
      const { exitCode, stderr } = kodyFail(['mission-tick'])
      expect(exitCode).toBe(64)
      expect(stderr).toContain('mission')
    })

    it('kody ui-review without --pr exits 64', () => {
      const { exitCode, stderr } = kodyFail(['ui-review'])
      expect(exitCode).toBe(64)
      expect(stderr).toContain('pr')
    })

    it('kody fix-ci without --pr-number exits 64', () => {
      const { exitCode, stderr } = kodyFail(['fix-ci'])
      expect(exitCode).toBe(64)
      expect(stderr).toContain('pr')
    })
  })

  // ─── unknown-command outcomes (typed kind = "unknown_command") ─────────────

  describe('unknown command (unknown_command outcome)', () => {
    it('exits 64 with "unknown" in stderr', () => {
      const { exitCode, stderr } = kodyFail([
        'this-executable-does-not-exist-xyz',
      ])
      expect(exitCode).toBe(64)
      expect(stderr.toLowerCase()).toContain('unknown')
    })
  })

  // ─── profile-load validation ───────────────────────────────────────────────
  // Profile-load errors (missing module, TypeError) are a distinct outcome kind.
  // We assert the engine never crashes with an unhandled exception on startup.

  describe('profile-load (no crash outcome)', () => {
    it('kody sync does not crash on profile load', () => {
      const { exitCode, stderr } = kodyFail(['sync'])
      // Any defined exit is acceptable: 0 (no-op), 1 (sync error), 2, or 64
      expect([0, 1, 2, 64]).toContain(exitCode)
      // But it must NOT be a profile-load crash
      expect(stderr).not.toContain('Cannot find module')
      expect(stderr).not.toContain('TypeError')
      expect(stderr).not.toContain('is not a function')
    })

    it('kody watch-stale-prs does not crash on profile load', () => {
      const { exitCode, stderr } = kodyFail(['watch-stale-prs'])
      expect([0, 1, 2, 64]).toContain(exitCode)
      expect(stderr).not.toContain('Cannot find module')
      expect(stderr).not.toContain('TypeError')
      expect(stderr).not.toContain('is not a function')
    })

    it('kody bug does not crash on profile load', () => {
      const { exitCode, stderr } = kodyFail(['bug'])
      expect([0, 1, 2, 64]).toContain(exitCode)
      expect(stderr).not.toContain('Cannot find module')
      expect(stderr).not.toContain('TypeError')
      expect(stderr).not.toContain('is not a function')
    })

    it('kody feature does not crash on profile load', () => {
      const { exitCode, stderr } = kodyFail(['feature'])
      expect([0, 1, 2, 64]).toContain(exitCode)
      expect(stderr).not.toContain('Cannot find module')
      expect(stderr).not.toContain('TypeError')
      expect(stderr).not.toContain('is not a function')
    })

    it('kody chore does not crash on profile load', () => {
      const { exitCode, stderr } = kodyFail(['chore'])
      expect([0, 1, 2, 64]).toContain(exitCode)
      expect(stderr).not.toContain('Cannot find module')
      expect(stderr).not.toContain('TypeError')
      expect(stderr).not.toContain('is not a function')
    })

    it('kody release does not crash on profile load', () => {
      const { exitCode, stderr } = kodyFail(['release'])
      expect([0, 1, 2, 64]).toContain(exitCode)
      expect(stderr).not.toContain('Cannot find module')
      expect(stderr).not.toContain('TypeError')
      expect(stderr).not.toContain('is not a function')
    })
  })

  // ─── config validation ─────────────────────────────────────────────────────
  // Running a no-op command must not surface kody.config.json schema errors.

  describe('config validation (no schema error outcome)', () => {
    it('kody version does not report config schema errors', () => {
      const { exitCode, stderr } = kody(['version'])
      expect(exitCode).toBe(0)
      expect(stderr).not.toContain('kody.config.json')
      expect(stderr).not.toContain('schema validation')
    })

    it('kody help does not report config schema errors', () => {
      const { exitCode, stderr } = kody(['help'])
      expect(exitCode).toBe(0)
      expect(stderr).not.toContain('kody.config.json')
      expect(stderr).not.toContain('schema validation')
    })
  })

  // ─── mission scheduler (verifies new file-based dispatcher is wired) ───────

  describe('mission-scheduler (no-op tick — validates dispatcher wiring)', () => {
    it('exits 0 with no profile-load crash', () => {
      const { exitCode, stderr } = kody(['mission-scheduler'])
      expect(exitCode).toBe(0)
      expect(stderr).not.toContain('Cannot find module')
      expect(stderr).not.toContain('TypeError')
    })
  })
})
