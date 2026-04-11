import { NextRequest } from 'next/server'
import { metrics } from '@/middleware/metrics'

export const GET = async (request: NextRequest) => {
  const data = metrics.getMetrics()
  return Response.json(data, { status: 200 })
}