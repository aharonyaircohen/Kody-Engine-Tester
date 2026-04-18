import { NextRequest } from 'next/server'

export const GET = async (_request: NextRequest) => {
  return new Response(JSON.stringify({ status: 'ok' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
