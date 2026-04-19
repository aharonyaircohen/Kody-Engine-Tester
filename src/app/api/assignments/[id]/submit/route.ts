import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest } from 'next/server'
import { withAuth, type RouteContext } from '@/auth/withAuth'

interface SubmitBody {
  studentId: string
  content: object
  attachmentIds?: string[]
}

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export const POST = withAuth(handleSubmit)

export async function handleSubmit(
  request: NextRequest,
  { user }: RouteContext,
  routeParams?: { params: Promise<{ id: string }> },
): Promise<Response> {
  if (!user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: JSON_HEADERS,
    })
  }

  const params = await routeParams?.params
  const id = params?.id

  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id parameter' }), {
      status: 400,
      headers: JSON_HEADERS,
    })
  }

  let body: SubmitBody
  try {
    body = await request.json()
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid JSON body' }),
      { status: 400, headers: JSON_HEADERS },
    )
  }

  const { studentId, content, attachmentIds = [] } = body

  if (!studentId || !content) {
    return new Response(
      JSON.stringify({ success: false, error: 'studentId and content are required' }),
      { status: 400, headers: JSON_HEADERS },
    )
  }

  const payload = await getPayload({ config: configPromise })

  // Fetch the assignment
  const assignment = await payload.findByID({
    collection: 'assignments' as any,
    id,
    depth: 0,
  }) as any

  if (!assignment) {
    return new Response(
      JSON.stringify({ success: false, error: 'Assignment not found' }),
      { status: 404, headers: JSON_HEADERS },
    )
  }

  // Check if past due
  if (assignment.dueDate) {
    const dueDate = new Date(assignment.dueDate)
    if (dueDate < new Date()) {
      return new Response(
        JSON.stringify({ success: false, error: 'Assignment past due' }),
        { status: 400, headers: JSON_HEADERS },
      )
    }
  }

  // Check for existing submission
  const existing = await payload.find({
    collection: 'submissions' as any,
    where: {
      assignment: { equals: id },
      student: { equals: studentId },
    },
    limit: 1,
  })

  if (existing.totalDocs > 0) {
    return new Response(
      JSON.stringify({ success: false, error: 'Already submitted' }),
      { status: 409, headers: JSON_HEADERS },
    )
  }

  // Create the submission
  const submission = await payload.create({
    collection: 'submissions' as any,
    data: {
      assignment: id,
      student: studentId,
      content,
      attachments: attachmentIds.map((attachmentId) => ({ file: attachmentId })),
      submittedAt: new Date().toISOString(),
      status: 'submitted',
    } as any,
  })

  return new Response(
    JSON.stringify({ success: true, data: submission }),
    { status: 201, headers: JSON_HEADERS },
  )
}
