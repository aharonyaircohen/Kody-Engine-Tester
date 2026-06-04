import { NextRequest } from 'next/server'

export const GET = async (request: NextRequest) => {
  return new Response(
    JSON.stringify({
      status: 'ok',
      healthy: true,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}