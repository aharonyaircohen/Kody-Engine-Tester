import { NextRequest } from 'next/server'
import { discussionsStore } from '@/collections/Discussions'
import type {
  CreatePostInput,
  DiscussionPost,
  RichTextContent,
} from '@/collections/Discussions'

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

export const GET = async (request: NextRequest) => {
  const lessonId = request.nextUrl.searchParams.get('lesson')
  if (!lessonId) {
    return jsonResponse({ success: false, error: 'lesson query parameter is required' }, 400)
  }
  const posts = discussionsStore.getByLesson(lessonId)
  return jsonResponse({ success: true, data: posts }, 200)
}

export const POST = async (request: NextRequest) => {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400)
  }

  if (typeof body !== 'object' || body === null) {
    return jsonResponse({ success: false, error: 'Request body must be a JSON object' }, 400)
  }

  const { lesson, author, content, parentPost } = body as Record<string, unknown>

  if (typeof lesson !== 'string' || lesson.trim() === '') {
    return jsonResponse({ success: false, error: 'lesson is required and must be a non-empty string' }, 400)
  }
  if (typeof author !== 'string' || author.trim() === '') {
    return jsonResponse({ success: false, error: 'author is required and must be a non-empty string' }, 400)
  }
  if (!isRichTextContent(content)) {
    return jsonResponse({ success: false, error: 'content is required and must be a RichTextContent object' }, 400)
  }
  if (parentPost !== undefined && parentPost !== null && typeof parentPost !== 'string') {
    return jsonResponse({ success: false, error: 'parentPost must be a string or null' }, 400)
  }

  const input: CreatePostInput = {
    lesson: lesson.trim(),
    author: author.trim(),
    content,
    parentPost: parentPost ?? null,
  }

  const post = discussionsStore.create(input)
  return jsonResponse({ success: true, data: post }, 201)
}
