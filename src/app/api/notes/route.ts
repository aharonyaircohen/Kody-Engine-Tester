import { NextRequest } from 'next/server'
import type { CollectionSlug, Where } from 'payload'
import { getPayloadInstance } from '@/services/progress'
import { sanitizeHtml } from '@/security/sanitizers'
import { withAuth } from '@/auth/withAuth'
import type { Note } from '@/collections/notes'

type NoteDoc = {
  id: string | number
  title: string
  content: string
  tags: unknown
  createdAt: string
  updatedAt: string
}

function docToNote(doc: NoteDoc): Note {
  return {
    id: String(doc.id),
    title: doc.title,
    content: doc.content,
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    createdAt: new Date(doc.createdAt),
    updatedAt: new Date(doc.updatedAt),
  }
}

export const GET = withAuth(async (request: NextRequest) => {
  const payload = await getPayloadInstance()
  const q = request.nextUrl.searchParams.get('q')

  const where: Where | undefined = q
    ? {
        or: [
          { title: { contains: q } } as Where,
          { content: { contains: q } } as Where,
        ],
      }
    : undefined

  const result = await payload.find({
    collection: 'notes' as CollectionSlug,
    where,
    sort: '-updatedAt',
  })

  const notes = (result.docs as unknown as NoteDoc[]).map(docToNote)
  return new Response(JSON.stringify(notes), {
    headers: { 'Content-Type': 'application/json' },
  })
}, { optional: true })

export const POST = withAuth(async (request: NextRequest, { user }) => {
  // Only admin and editor can create notes
  if (user!.role !== 'admin' && user!.role !== 'editor') {
    return new Response(JSON.stringify({ error: 'Forbidden: requires admin or editor role' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await request.json()
  const title = sanitizeHtml(String(body.title ?? ''))
  const content = sanitizeHtml(String(body.content ?? ''))
  const tags = Array.isArray(body.tags)
    ? body.tags.map((t: unknown) => sanitizeHtml(String(t)))
    : []

  if (!title || !content) {
    return new Response(JSON.stringify({ error: 'title and content are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const payload = await getPayloadInstance()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = await payload.create({
    collection: 'notes' as CollectionSlug,
    data: { title, content, tags } as any,
  })

  return new Response(JSON.stringify(docToNote(doc as unknown as NoteDoc)), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  })
}, { roles: ['admin', 'editor'] })
