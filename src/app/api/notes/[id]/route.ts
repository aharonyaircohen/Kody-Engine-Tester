import { NextRequest } from 'next/server'
import type { CollectionSlug } from 'payload'
import { getPayloadInstance } from '@/services/progress'
import { sanitizeHtml } from '@/security/sanitizers'
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const payload = await getPayloadInstance()
  try {
    const doc = await payload.findByID({
      collection: 'notes' as CollectionSlug,
      id,
    })
    return new Response(JSON.stringify(docToNote(doc as unknown as NoteDoc)), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Note not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await request.json()
  const data: Record<string, unknown> = {}
  if (body.title !== undefined) data.title = sanitizeHtml(String(body.title))
  if (body.content !== undefined) data.content = sanitizeHtml(String(body.content))
  if (body.tags !== undefined) {
    data.tags = Array.isArray(body.tags)
      ? body.tags.map((t: unknown) => sanitizeHtml(String(t)))
      : []
  }

  const payload = await getPayloadInstance()
  try {
    const doc = await payload.update({
      collection: 'notes' as CollectionSlug,
      id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: data as any,
    })
    return new Response(JSON.stringify(docToNote(doc as unknown as NoteDoc)), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Note not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const payload = await getPayloadInstance()
  try {
    await payload.delete({
      collection: 'notes' as CollectionSlug,
      id,
    })
    return new Response(null, { status: 204 })
  } catch {
    return new Response(JSON.stringify({ error: 'Note not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
