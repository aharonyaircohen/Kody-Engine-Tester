import { NextRequest } from 'next/server'

const version = process.env.npm_package_version ?? '1.0.0'

export const GET = async (request: NextRequest) => {
  return new Response(
    JSON.stringify({
      status: 'ok',
      uptime: process.uptime(),
      version,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}