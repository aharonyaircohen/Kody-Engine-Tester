import { NextRequest } from 'next/server'
import type { CollectionSlug } from 'payload'
import { withAuth } from '@/auth/withAuth'
import { getPayloadInstance } from '@/services/progress'

/**
 * Normalizes a relationship ID to a string.
 * Payload relationship fields return { id: string } objects when populated,
 * or plain string IDs otherwise.
 */
function normalizeId(value: string | { id: string }): string {
  return typeof value === 'string' ? value : value.id
}

interface EnrollmentDoc {
  id: string
  course: string | { id: string }
  enrolledAt: string
  status: string
  completedLessons: (string | { id: string })[]
}

interface CourseDoc {
  id: string
  title: string
}

export const GET = withAuth(async (request: NextRequest, { user }) => {
  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }

  const payload = await getPayloadInstance()
  const userId = String(user.id)

  // Fetch all enrollments for the logged-in student
  const { docs: enrollments } = (await payload.find({
    collection: 'enrollments' as CollectionSlug,
    where: { student: { equals: userId } },
    depth: 1,
  })) as unknown as { docs: EnrollmentDoc[] }

  // Fetch all certificates for the logged-in student
  const { docs: certificates } = (await payload.find({
    collection: 'certificates' as CollectionSlug,
    where: { student: { equals: userId } },
    limit: 0,
  })) as unknown as { docs: { id: string }[] }

  const enrollmentsData = await Promise.all(
    enrollments.map(async (enrollment) => {
      const courseId =
        typeof enrollment.course === 'string'
          ? enrollment.course
          : (enrollment.course as { id: string }).id

      // Fetch course title
      const course = (await payload.findByID({
        collection: 'courses' as CollectionSlug,
        id: courseId,
      })) as unknown as CourseDoc

      // Count total lessons in the course
      const { totalDocs: totalLessons } = await payload.find({
        collection: 'lessons' as CollectionSlug,
        where: { course: { equals: courseId } },
        limit: 0,
      })

      // Normalize completedLessons to string array
      const completedLessons = (enrollment.completedLessons ?? []).map(normalizeId)
      const completedCount = completedLessons.length
      const progressPercent =
        totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

      return {
        courseId,
        courseTitle: course.title,
        progressPercent,
        lastAccessedAt: enrollment.enrolledAt ?? null,
      }
    })
  )

  const coursesEnrolled = enrollments.length
  const coursesCompleted = enrollments.filter((e) => e.status === 'completed').length
  const certificatesEarned = certificates.length

  return Response.json({
    success: true,
    data: {
      enrollments: enrollmentsData,
      totals: {
        coursesEnrolled,
        coursesCompleted,
        certificatesEarned,
      },
    },
  })
})
