import { NextRequest } from 'next/server'
import { discussionsStore } from '@/collections/Discussions'
import { withAuth } from '@/auth/withAuth'
import { created, badRequest, ok, serializePost, isRichTextContent } from './_utils'

export const GET = withAuth(
  async (request: NextRequest) => {
    const lesson = request.nextUrl.searchParams.get('lesson')

    if (!lesson) {
      return badRequest('Missing required query parameter: lesson')
    }

    const posts = discussionsStore.getByLesson(lesson)
    return ok(posts.map(serializePost))
  },
  { optional: true }
)

export const POST = withAuth(async (request: NextRequest, { user }) => {
  if (!user) {
    return new Response(JSON.stringify({ success: false, error: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('Invalid JSON body')
  }

  if (typeof body !== 'object' || body === null) {
    return badRequest('Body must be a JSON object')
  }

  const { lesson: rawLesson, content, parentPost } = body as Record<string, unknown>

  if (!rawLesson || typeof rawLesson !== 'string') {
    return badRequest('Field "lesson" is required and must be a non-empty string')
  }

  if (!isRichTextContent(content)) {
    return badRequest('Field "content" is required and must be a valid RichTextContent object')
  }

  if (parentPost !== undefined && parentPost !== null && typeof parentPost !== 'string') {
    return badRequest('Field "parentPost" must be a string or null')
  }

  const post = discussionsStore.create({
    lesson: rawLesson,
    author: String(user.id),
    content,
    parentPost: parentPost as string | null | undefined,
  })

  return created(serializePost(post))
})
