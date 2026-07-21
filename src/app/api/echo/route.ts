import { NextRequest } from 'next/server'

export const GET = async (request: NextRequest) => {
  const msg = request.nextUrl.searchParams.get('msg')

  if (!msg) {
    return new Response(JSON.stringify({ error: 'msg is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(
    JSON.stringify({
      echo: msg,
      length: msg.length,
      reversed: msg.split('').reverse().join(''),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
