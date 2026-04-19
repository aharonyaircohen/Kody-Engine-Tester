import { NextRequest } from 'next/server'
import { discussionsStore } from '@/collections/Discussions'
import { withAuth } from '@/auth/withAuth'
import { ok, badRequest, notFound, noContent, serializePost, isRichTextContent } from '../_utils'
import type { UpdatePostInput } from '@/collections/Discussions'
import type { RouteContext } from '@/auth/withAuth'

export async function handlePatch(
  _request: NextRequest,
  { user }: RouteContext,
  routeParams?: { params: Promise<{ id: string }> }
): Promise<Response> {
  if (!user) {
    return new Response(JSON.stringify({ success: false, error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const params = await routeParams?.params
  const id = params?.id
  if (!id) {
    return badRequest('Missing id parameter')
  }

  let body: unknown
  try {
    body = await _request.json()
  } catch {
    return badRequest('Invalid JSON body')
  }

  if (typeof body !== 'object' || body === null) {
    return badRequest('Body must be a JSON object')
  }

  const { content, isPinned, isResolved } = body as Record<string, unknown>

  const update: UpdatePostInput = {}

  if (content !== undefined) {
    if (!isRichTextContent(content)) {
      return badRequest('Field "content" must be a valid RichTextContent object')
    }
    update.content = content
  }

  if (isPinned !== undefined) {
    if (typeof isPinned !== 'boolean') {
      return badRequest('Field "isPinned" must be a boolean')
    }
    update.isPinned = isPinned
  }

  if (isResolved !== undefined) {
    if (typeof isResolved !== 'boolean') {
      return badRequest('Field "isResolved" must be a boolean')
    }
    update.isResolved = isResolved
  }

  if (Object.keys(update).length === 0) {
    return badRequest('At least one of "content", "isPinned", or "isResolved" must be provided')
  }

  const existing = discussionsStore.getById(id)
  if (!existing) {
    return notFound(`Discussion post with id "${id}" not found`)
  }

  const updated = discussionsStore.update(id, update)
  return ok(serializePost(updated))
}

export async function handleDelete(
  _request: NextRequest,
  { user }: RouteContext,
  routeParams?: { params: Promise<{ id: string }> }
): Promise<Response> {
  if (!user) {
    return new Response(JSON.stringify({ success: false, error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const params = await routeParams?.params
  const id = params?.id
  if (!id) {
    return badRequest('Missing id parameter')
  }

  const existing = discussionsStore.getById(id)
  if (!existing) {
    return notFound(`Discussion post with id "${id}" not found`)
  }

  discussionsStore.delete(id)
  return noContent()
}

export const PATCH = withAuth(handlePatch)
export const DELETE = withAuth(handleDelete)

