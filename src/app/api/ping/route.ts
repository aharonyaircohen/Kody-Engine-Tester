import { NextRequest } from 'next/server'

export const GET = async (request: NextRequest) => {
  return new Response('pong', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  })
}