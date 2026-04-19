import { NextRequest } from 'next/server'
import { discussionsStore } from '@/collections/Discussions'
import type { UpdatePostInput, RichTextContent } from '@/collections/Discussions'

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string }

function jsonResponse<T>(body: ApiResponse<T>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function isRichTextContent(value: unknown): value is RichTextContent {
  return (
    typeof value === 'object' &&
    value !== null &&
    'root' in value &&
    typeof (value as RichTextContent).root === 'object'
  )
}

export const PATCH = async (
  request: NextRequest,
  routeParams?: { params: Promise<{ id: string }> },
) => {
  const params = await routeParams?.params
  const id = params?.id

  if (!id) {
    return jsonResponse({ success: false, error: 'id parameter is required' }, 400)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400)
  }

  if (typeof body !== 'object' || body === null) {
    return jsonResponse({ success: false, error: 'Request body must be a JSON object' }, 400)
  }

  const { content, isPinned, isResolved } = body as Record<string, unknown>

  const updates: UpdatePostInput = {}

  if (content !== undefined) {
    if (!isRichTextContent(content)) {
      return jsonResponse({ success: false, error: 'content must be a RichTextContent object' }, 400)
    }
    updates.content = content
  }

  if (isPinned !== undefined) {
    if (typeof isPinned !== 'boolean') {
      return jsonResponse({ success: false, error: 'isPinned must be a boolean' }, 400)
    }
    updates.isPinned = isPinned
  }

  if (isResolved !== undefined) {
    if (typeof isResolved !== 'boolean') {
      return jsonResponse({ success: false, error: 'isResolved must be a boolean' }, 400)
    }
    updates.isResolved = isResolved
  }

  if (Object.keys(updates).length === 0) {
    return jsonResponse({ success: false, error: 'At least one field (content, isPinned, isResolved) must be provided' }, 400)
  }

  try {
    const updated = discussionsStore.update(id, updates)
    return jsonResponse({ success: true, data: updated }, 200)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    if (message.includes('not found')) {
      return jsonResponse({ success: false, error: `Discussion post with id "${id}" not found` }, 404)
    }
    throw err
  }
}

export const DELETE = async (
  _request: NextRequest,
  routeParams?: { params: Promise<{ id: string }> },
) => {
  const params = await routeParams?.params
  const id = params?.id

  if (!id) {
    return jsonResponse({ success: false, error: 'id parameter is required' }, 400)
  }

  const deleted = discussionsStore.delete(id)
  if (!deleted) {
    return jsonResponse({ success: false, error: `Discussion post with id "${id}" not found` }, 404)
  }

  return jsonResponse({ success: true, data: null }, 200)
}
