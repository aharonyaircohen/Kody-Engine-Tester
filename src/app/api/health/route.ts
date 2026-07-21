/**
 * GET /api/health
 *
 * Response shape:
 * {
 *   status: "ok",
 *   uptime: number,       // seconds since process start
 *   timestamp: string     // ISO 8601
 * }
 */

import { NextRequest } from 'next/server'

export const GET = async (request: NextRequest) => {
  return new Response(
    JSON.stringify({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}