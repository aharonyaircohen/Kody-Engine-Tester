import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import type { CollectionSlug } from 'payload'
import config from '@/payload.config'
import { ProgressService } from '@/services/progress'
import { CourseProgressCard } from '@/components/dashboard/CourseProgressCard'
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import type { Deadline } from '@/components/dashboard/UpcomingDeadlines'
import type { Activity } from '@/components/dashboard/RecentActivity'

// Narrow types for Payload documents used in this page to avoid per-line eslint-disable
type PayloadDoc = Record<string, unknown> & { id: string }
type EnrollmentDoc = PayloadDoc & {
  course: { id: string; title?: string } | string
  completedLessons?: Array<string | { id: string }>
}
type LessonDoc = PayloadDoc & { course: { id: string } | string; title?: string }
type AssignmentDoc = PayloadDoc & { title: string; dueDate: string }
type QuizAttemptDoc = PayloadDoc & {
  quiz: { title?: string } | string
  passed?: boolean
  score?: number
  completedAt?: string
  startedAt?: string
}
type SubmissionDoc = PayloadDoc & {
  assignment: { title?: string } | string
  submittedAt: string
}

export default async function DashboardPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/admin/login')
  }

  const userWithRole = user as unknown as PayloadDoc & { role?: string }
  if (userWithRole.role && userWithRole.role !== 'student') {
    redirect('/')
  }

  const progressService = new ProgressService(payload)

  // Fetch student enrollments
  const { docs: enrollments } = await payload.find({
    collection: 'enrollments' as CollectionSlug,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: { student: { equals: user.id }, status: { not_equals: 'dropped' } } as any,
    depth: 1,
  })

  // Batch-fetch all lessons for enrolled courses in one query to avoid N+1
  const typedEnrollments = enrollments as unknown as EnrollmentDoc[]
  const enrolledCourseIds = typedEnrollments
    .map((e) => (typeof e.course === 'object' ? e.course?.id : e.course))
    .filter(Boolean) as string[]

  let allLessons: LessonDoc[] = []
  if (enrolledCourseIds.length > 0) {
    const { docs } = await payload.find({
      collection: 'lessons' as CollectionSlug,
      where: { course: { in: enrolledCourseIds } },
      limit: 1000,
    })
    allLessons = docs as unknown as LessonDoc[]
  }

  // Build progress cards data
  const progressResults = await Promise.all(
    typedEnrollments.map((enrollment) => progressService.getProgress(enrollment.id)),
  )

  const courseCards = typedEnrollments.map((enrollment, i) => {
    const progress = progressResults[i]
    const course = typeof enrollment.course === 'object' ? enrollment.course : null
    const courseTitle = course?.title ?? 'Unknown Course'
    const courseId = course?.id ?? (typeof enrollment.course === 'string' ? enrollment.course : '')

    const lessons = allLessons.filter((l) => {
      const lCourse = typeof l.course === 'object' ? l.course?.id : l.course
      return lCourse === courseId
    })
    const completedIds = (enrollment.completedLessons ?? []).map((l) =>
      typeof l === 'string' ? l : l.id,
    )
    const nextLesson = lessons.find((l) => !completedIds.includes(l.id))

    return {
      id: enrollment.id,
      courseTitle,
      percentage: progress.percentage,
      grade: null as number | null,
      nextLessonTitle: nextLesson?.title ?? null,
      nextLessonHref: nextLesson ? `/lessons/${nextLesson.id}` : null,
    }
  })

  // Fetch upcoming assignment deadlines for enrolled courses
  // Note: Assignments reference modules via text field, query assignments with due dates
  let deadlines: Deadline[] = []
  if (enrolledCourseIds.length > 0) {
    const { docs: assignments } = await payload.find({
      collection: 'assignments' as CollectionSlug,
      where: {
        dueDate: { greater_than: new Date().toISOString() },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      sort: 'dueDate',
      limit: 5,
    })
    deadlines = (assignments as unknown as AssignmentDoc[]).map((a) => ({
      id: a.id,
      title: a.title,
      dueDate: a.dueDate,
      type: 'assignment' as const,
    }))
  }

  // Fetch recent activity: quiz attempts and submissions
  const activities: Activity[] = []
  const { docs: recentAttempts } = await payload.find({
    collection: 'quiz-attempts' as CollectionSlug,
    where: { user: { equals: user.id } },
    sort: '-completedAt',
    limit: 5,
    depth: 1,
  })
  for (const attempt of recentAttempts as unknown as QuizAttemptDoc[]) {
    const quizTitle = typeof attempt.quiz === 'object' ? attempt.quiz?.title : 'Quiz'
    activities.push({
      id: `qa-${attempt.id}`,
      description: `Quiz attempt: ${quizTitle} — ${attempt.passed ? 'Passed' : 'Failed'} (${attempt.score}%)`,
      timestamp: (attempt.completedAt ?? attempt.startedAt) as string,
    })
  }
  const { docs: recentSubmissions } = await payload.find({
    collection: 'submissions' as CollectionSlug,
    where: { student: { equals: user.id } },
    sort: '-submittedAt',
    limit: 5,
    depth: 1,
  })
  for (const sub of recentSubmissions as unknown as SubmissionDoc[]) {
    const assignTitle = typeof sub.assignment === 'object' ? sub.assignment?.title : 'Assignment'
    activities.push({
      id: `sub-${sub.id}`,
      description: `Submitted: ${assignTitle}`,
      timestamp: sub.submittedAt,
    })
  }
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <h1>My Dashboard</h1>

      {courseCards.length === 0 ? (
        <p>You are not enrolled in any courses yet.</p>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: 16,
              marginBottom: 32,
            }}
          >
            {courseCards.map((card) => (
              <CourseProgressCard key={card.id} {...card} />
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: 16,
            }}
          >
            <UpcomingDeadlines deadlines={deadlines} />
            <RecentActivity activities={activities.slice(0, 10)} />
          </div>
        </>
      )}
    </div>
  )
}
