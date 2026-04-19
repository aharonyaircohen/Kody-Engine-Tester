import type { DiscussionPost, RichTextContent } from '@/collections/Discussions'

/** Convert a DiscussionPost to a plain JSON-safe object (Date → ISO string). */
export function serializePost(post: DiscussionPost): Record<string, unknown> {
  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }
}

/** Build a standard API envelope response. */
export function ok<T>(data: T): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function created<T>(data: T): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function noContent(): Response {
  return new Response(null, { status: 204 })
}

export function badRequest(error: string): Response {
  return new Response(JSON.stringify({ success: false, error }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function notFound(error: string): Response {
  return new Response(JSON.stringify({ success: false, error }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Validate that `value` is a non-null object with a `root` property that
 * is also a non-null object — the minimum shape of a RichTextContent document.
 */
export function isRichTextContent(value: unknown): value is RichTextContent {
  return (
    typeof value === 'object' &&
    value !== null &&
    'root' in value &&
    typeof (value as RichTextContent).root === 'object' &&
    (value as RichTextContent).root !== null
  )
}
