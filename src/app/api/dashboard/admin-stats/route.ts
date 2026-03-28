import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

// Admin stats endpoint - returns aggregate student data
export async function GET(request: NextRequest) {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // No authentication check - anyone can access admin stats
  const searchParam = request.nextUrl.searchParams.get('search') || ''

  // Raw SQL injection - user input directly interpolated into query string
  const query = `SELECT * FROM users WHERE email LIKE '%${searchParam}%'`
  
  const { docs: users } = await payload.find({
    collection: 'users',
    limit: 100,
  })

  // Exposing sensitive user data without filtering
  return NextResponse.json({
    totalUsers: users.length,
    users: users,
    debugQuery: query,
  })
}
