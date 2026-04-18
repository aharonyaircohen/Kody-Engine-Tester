import { NextRequest } from 'next/server'
import type { CollectionSlug } from 'payload'
import { withAuth } from '@/auth/withAuth'
import { getPayloadInstance } from '@/services/progress'

export const POST = withAuth(async (request: NextRequest, { user }) => {
  // Only viewers (formerly students) can enroll
  if (user!.role !== 'viewer' && user!.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Forbidden: requires viewer role' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await request.json()
  const { courseId } = body

  if (!courseId) {
    return new Response(JSON.stringify({ error: 'courseId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const payload = await getPayloadInstance()

  // Check for existing enrollment
  const existing = await payload.find({
    collection: 'enrollments' as CollectionSlug,
    where: {
      student: { equals: user!.id },
      course: { equals: courseId },
    },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    return new Response(JSON.stringify({ error: 'Already enrolled in this course' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Fetch the course to check maxEnrollments
  const course = (await payload.findByID({
    collection: 'courses' as CollectionSlug,
    id: courseId,
  })) as unknown as { maxEnrollments: number }

  const maxEnrollments = course.maxEnrollments

  // Count active enrollments for this course
  const { totalDocs: activeCount } = await payload.find({
    collection: 'enrollments' as CollectionSlug,
    where: {
      course: { equals: courseId },
      status: { equals: 'active' },
    },
    limit: 0,
  })

  if (activeCount >= maxEnrollments) {
    return new Response(JSON.stringify({ error: 'Course has reached maximum enrollment capacity' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const enrollment = await payload.create({
    collection: 'enrollments' as CollectionSlug,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: {
      student: user!.id,
      course: courseId,
      enrolledAt: new Date().toISOString(),
      status: 'active',
      completedLessons: [],
    } as any,
  })

  return new Response(JSON.stringify(enrollment), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  })
}, { roles: ['viewer', 'admin'] })
