import { NextRequest } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export const GET = async (request: NextRequest) => {
  const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'))

  return new Response(
    JSON.stringify({
      status: 'ok',
      uptime: process.uptime(),
      version: packageJson.version,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}