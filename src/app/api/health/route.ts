import { NextRequest } from 'next/server'

export const GET = async (request: NextRequest) => {
  return new Response(
    JSON.stringify({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: '1.0.16',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}