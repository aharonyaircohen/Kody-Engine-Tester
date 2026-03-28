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

export default async function DashboardPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/admin/login')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((user as any).role && (user as any).role !== 'student') {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enrolledCourseIds = (enrollments as any[])
    .map((e) => (typeof e.course === 'object' ? e.course?.id : e.course))
    .filter(Boolean) as string[]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let allLessons: any[] = []
  if (enrolledCourseIds.length > 0) {
    const { docs } = await payload.find({
      collection: 'lessons' as CollectionSlug,
      where: { course: { in: enrolledCourseIds } },
      limit: 1000,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allLessons = docs as any[]
  }

  // Build progress cards data
  const progressResults = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (enrollments as any[]).map((enrollment) => progressService.getProgress(enrollment.id)),
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const courseCards = (enrollments as any[]).map((enrollment, i) => {
    const progress = progressResults[i]
    const course = typeof enrollment.course === 'object' ? enrollment.course : null
    const courseTitle = course?.title ?? 'Unknown Course'
    const courseId = course?.id ?? (typeof enrollment.course === 'string' ? enrollment.course : '')

    const lessons = allLessons.filter((l) => {
      const lCourse = typeof l.course === 'object' ? l.course?.id : l.course
      return lCourse === courseId
    })
    const completedIds = ((enrollment.completedLessons ?? []) as unknown[]).map((l) =>
      typeof l === 'string' ? l : (l as { id: string }).id,
    )
    const nextLesson = lessons.find((l) => !completedIds.includes(l.id))

    return {
      id: enrollment.id as string,
      courseTitle,
      percentage: progress.percentage,
      grade: null as number | null,
      nextLessonTitle: (nextLesson?.title as string) ?? null,
      nextLessonHref: nextLesson ? `/lessons/${nextLesson.id as string}` : null,
    }
  })

  // Fetch upcoming assignment deadlines for enrolled courses
  let deadlines: Deadline[] = []
  if (enrolledCourseIds.length > 0) {
    const { docs: modules } = await payload.find({
      collection: 'modules' as CollectionSlug,
      where: { course: { in: enrolledCourseIds } },
      limit: 100,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moduleIds = (modules as any[]).map((m) => m.id as string)
    if (moduleIds.length > 0) {
      const { docs: assignments } = await payload.find({
        collection: 'assignments' as CollectionSlug,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: {
          module: { in: moduleIds },
          dueDate: { greater_than: new Date().toISOString() },
        } as any,
        sort: 'dueDate',
        limit: 5,
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      deadlines = (assignments as any[]).map((a) => ({
        id: a.id as string,
        title: a.title as string,
        dueDate: a.dueDate as string,
        type: 'assignment' as const,
      }))
    }
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const attempt of recentAttempts as any[]) {
    const quizTitle = typeof attempt.quiz === 'object' ? attempt.quiz?.title : 'Quiz'
    activities.push({
      id: `qa-${attempt.id as string}`,
      description: `Quiz attempt: ${quizTitle as string} — ${attempt.passed ? 'Passed' : 'Failed'} (${attempt.score as number}%)`,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const sub of recentSubmissions as any[]) {
    const assignTitle = typeof sub.assignment === 'object' ? sub.assignment?.title : 'Assignment'
    activities.push({
      id: `sub-${sub.id as string}`,
      description: `Submitted: ${assignTitle as string}`,
      timestamp: sub.submittedAt as string,
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
