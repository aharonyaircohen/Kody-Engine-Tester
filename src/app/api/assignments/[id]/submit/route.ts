import { NextRequest } from 'next/server'
import { getPayloadInstance } from '@/services/progress'
import { withAuth } from '@/auth/withAuth'

interface SubmitBody {
  studentId: string
  content: object
  attachmentIds?: string[]
}

export const POST = withAuth(
  async (
    request: NextRequest,
    { user: _user },
    routeParams?: { params: Promise<{ id: string }> },
  ) => {
    const params = await routeParams?.params
    const id = params?.id

    if (!id) {
      return Response.json(
        { success: false, error: 'Missing id parameter' },
        { status: 400 }
      )
    }

    let body: SubmitBody
    try {
      body = await request.json()
    } catch {
      return Response.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const { studentId, content, attachmentIds } = body

    if (!studentId || typeof studentId !== 'string') {
      return Response.json(
        { success: false, error: 'studentId is required' },
        { status: 400 }
      )
    }

    if (!content || typeof content !== 'object') {
      return Response.json(
        { success: false, error: 'content is required and must be an object' },
        { status: 400 }
      )
    }

    const payload = await getPayloadInstance()

    // Fetch the assignment
    const assignment = await payload.findByID({
      collection: 'assignments' as any,
      id,
      depth: 0,
    })

    if (!assignment) {
      return Response.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Check if past due
    if (assignment.dueDate) {
      const dueDate = new Date(assignment.dueDate as string)
      const now = new Date()
      if (now > dueDate) {
        return Response.json(
          { success: false, error: 'Assignment past due' },
          { status: 400 }
        )
      }
    }

    // Check for existing submission for this (assignment, student) pair
    const existing = await payload.find({
      collection: 'submissions' as any,
      where: {
        assignment: { equals: id },
        student: { equals: studentId },
      },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      return Response.json(
        { success: false, error: 'Already submitted' },
        { status: 409 }
      )
    }

    // Build attachments array from attachmentIds
    const attachments = (attachmentIds ?? []).map((attachmentId) => ({
      file: attachmentId,
    }))

    // Create the submission
    const submission = await payload.create({
      collection: 'submissions' as any,
      data: {
        assignment: id,
        student: studentId,
        content,
        attachments,
        submittedAt: new Date(),
        status: 'submitted',
      } as any,
    })

    return Response.json(
      { success: true, data: submission },
      { status: 201 }
    )
  }
)
