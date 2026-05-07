import { NextRequest } from 'next/server'

/**
 * GET /api/healthz
 * Returns build metadata for uptime probes and post-deploy verification.
 * Env vars are injected at build time via the `build` script:
 *   APP_VERSION       — application version  (falls back to process.env.npm_package_version)
 *   GIT_SHA           — git short SHA       (falls back to "unknown")
 *   BUILD_TIMESTAMP   — ISO timestamp       (falls back to runtime ISO string)
 */
export const GET = async (_request: NextRequest) => {
  const version =
    process.env.APP_VERSION ??
    process.env.npm_package_version ??
    'unknown'
  const commit = process.env.GIT_SHA ?? 'unknown'
  const builtAt = process.env.BUILD_TIMESTAMP ?? new Date().toISOString()

  return new Response(
    JSON.stringify({ status: 'ok', version, commit, builtAt }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
