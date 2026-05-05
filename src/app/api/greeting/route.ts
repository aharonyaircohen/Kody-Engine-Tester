import { NextRequest } from 'next/server'
import { withAuth } from '@/auth/withAuth'
import { getPayloadInstance } from '@/services/progress'
import type { CollectionSlug } from 'payload'

const GREETINGS: Record<string, string> = {
  en: 'Hello',
  es: 'Hola',
  fr: 'Bonjour',
}

export const GET = withAuth(async (_request: NextRequest, { user }) => {
  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  const payload = await getPayloadInstance()

  const userDoc = await payload.findByID({
    collection: 'users' as CollectionSlug,
    id: String(user.id),
  })

  const locale = (userDoc as unknown as Record<string, unknown>).locale as string | undefined
  const greeting = GREETINGS[locale ?? 'en'] ?? 'Hello'

  return Response.json({ greeting }, { status: 200 })
})
