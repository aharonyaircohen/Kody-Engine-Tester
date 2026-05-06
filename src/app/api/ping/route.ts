import { NextRequest } from 'next/server'

export const GET = async (request: NextRequest) => {
  return new Response(
    JSON.stringify({ ok: true }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
