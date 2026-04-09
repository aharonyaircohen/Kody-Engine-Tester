import { NextRequest } from 'next/server'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

function getVersion(): string {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const packageJson = JSON.parse(readFileSync(join(__dirname, '../../../../../package.json'), 'utf8'))
  return packageJson.version
}

export const GET = async (request: NextRequest) => {
  return new Response(
    JSON.stringify({
      status: 'ok',
      uptime: process.uptime(),
      version: getVersion(),
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}