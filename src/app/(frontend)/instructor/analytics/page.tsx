import { AnalyticsCard } from '@/components/analytics/AnalyticsCard'
import { CompletionChart } from '@/components/analytics/CompletionChart'
import { AtRiskStudentsList } from '@/components/analytics/AtRiskStudentsList'
import { AnalyticsService } from '@/services/analytics'
import type { AnalyticsServiceDeps, EnrollmentRecord, ModuleRecord, QuizAttemptRecord, SubmissionRecord } from '@/services/analytics'
import { getPayloadInstance } from '@/services/progress'
import type { CollectionSlug } from 'payload'

function createPayloadDeps(): AnalyticsServiceDeps {
  return {
    getEnrollmentsByCourse: async (courseId: string): Promise<EnrollmentRecord[]> => {
      const payload = await getPayloadInstance()
      const { docs } = await payload.find({
        collection: 'enrollments' as CollectionSlug,
        where: { course: { equals: courseId } },
        limit: 0,
      })
      return (docs as unknown as Record<string, unknown>[]).map((doc) => ({
        id: String(doc.id),
        studentId: String((doc.student as { id: string })?.id ?? doc.student),
        studentName: (doc.student as { name?: string })?.name ?? 'Unknown',
        status: doc.status as EnrollmentRecord['status'],
        completedLessonIds: ((doc.completedLessons ?? []) as (string | { id: string })[]).map(
          (l) => (typeof l === 'string' ? l : l.id),
        ),
      }))
    },

    getModulesByCourse: async (courseId: string): Promise<ModuleRecord[]> => {
      const payload = await getPayloadInstance()
      const { docs: modules } = await payload.find({
        collection: 'modules' as CollectionSlug,
        where: { courseId: { equals: courseId } },
        limit: 0,
      })
      const moduleDocs = modules as unknown as Record<string, unknown>[]
      const result: ModuleRecord[] = []
      for (const mod of moduleDocs) {
        const { docs: lessons } = await payload.find({
          collection: 'lessons' as CollectionSlug,
          where: { course: { equals: courseId } },
          limit: 0,
        })
        result.push({
          id: String(mod.id),
          title: String(mod.title),
          lessonIds: (lessons as unknown as { id: string }[]).map((l) => String(l.id)),
        })
      }
      return result
    },

    getTotalLessonsByCourse: async (courseId: string): Promise<number> => {
      const payload = await getPayloadInstance()
      const { totalDocs } = await payload.find({
        collection: 'lessons' as CollectionSlug,
        where: { course: { equals: courseId } },
        limit: 0,
      })
      return totalDocs
    },

    getQuizAttemptsByCourse: async (courseId: string): Promise<QuizAttemptRecord[]> => {
      const payload = await getPayloadInstance()
      const { docs: modules } = await payload.find({
        collection: 'modules' as CollectionSlug,
        where: { courseId: { equals: courseId } },
        limit: 0,
      })
      const moduleIds = (modules as unknown as { id: string }[]).map((m) => String(m.id))
      if (moduleIds.length === 0) return []

      const { docs: quizzes } = await payload.find({
        collection: 'quizzes' as CollectionSlug,
        where: { module: { in: moduleIds } },
        limit: 0,
      })
      const quizIds = (quizzes as unknown as { id: string }[]).map((q) => String(q.id))
      if (quizIds.length === 0) return []

      const quizMap = new Map((quizzes as unknown as { id: string; title: string }[]).map((q) => [String(q.id), q.title]))

      const { docs: attempts } = await payload.find({
        collection: 'quiz-attempts' as CollectionSlug,
        where: { quiz: { in: quizIds } },
        limit: 0,
      })
      return (attempts as unknown as Record<string, unknown>[]).map((a) => ({
        quizId: String(a.quiz),
        quizTitle: quizMap.get(String(a.quiz)) ?? 'Unknown',
        userId: String(a.user),
        score: Number(a.score ?? 0),
      }))
    },

    getSubmissionsByCourse: async (courseId: string): Promise<SubmissionRecord[]> => {
      const payload = await getPayloadInstance()
      const { docs: modules } = await payload.find({
        collection: 'modules' as CollectionSlug,
        where: { courseId: { equals: courseId } },
        limit: 0,
      })
      const moduleIds = (modules as unknown as { id: string }[]).map((m) => String(m.id))
      if (moduleIds.length === 0) return []

      const { docs: assignments } = await payload.find({
        collection: 'assignments' as CollectionSlug,
        where: { module: { in: moduleIds } },
        limit: 0,
      })
      const assignmentIds = (assignments as unknown as { id: string }[]).map((a) => String(a.id))
      const maxScoreMap = new Map((assignments as unknown as { id: string; maxScore: number }[]).map((a) => [String(a.id), a.maxScore]))
      if (assignmentIds.length === 0) return []

      const { docs: submissions } = await payload.find({
        collection: 'submissions' as CollectionSlug,
        where: { assignment: { in: assignmentIds } },
        limit: 0,
      })
      return (submissions as unknown as Record<string, unknown>[]).map((s) => ({
        studentId: String((s.student as { id: string })?.id ?? s.student),
        grade: s.grade != null ? Number(s.grade) : null,
        maxScore: maxScoreMap.get(String((s.assignment as { id: string })?.id ?? s.assignment)) ?? 100,
      }))
    },

    getCoursesByInstructor: async (instructorId: string): Promise<{ id: string }[]> => {
      const payload = await getPayloadInstance()
      const { docs } = await payload.find({
        collection: 'courses' as CollectionSlug,
        where: { instructor: { equals: instructorId } },
        limit: 0,
      })
      return (docs as unknown as { id: string }[]).map((d) => ({ id: String(d.id) }))
    },
  }
}

export default async function InstructorAnalyticsPage() {
  // TODO: Read instructor ID from auth session once wired
  const instructorId = 'placeholder'

  const deps = createPayloadDeps()
  const svc = new AnalyticsService(deps)

  const overview = await svc.getInstructorOverview(instructorId)
  const courses = await deps.getCoursesByInstructor(instructorId)
  const courseAnalytics = courses.length > 0 ? await svc.getCourseAnalytics(courses[0].id) : null

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>Instructor Analytics</h1>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Overview</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <AnalyticsCard label="Total Courses" value={overview.totalCourses} />
          <AnalyticsCard label="Total Students" value={overview.totalStudents} />
          <AnalyticsCard label="Avg Completion Rate" value={`${overview.averageCompletionRate}%`} />
        </div>
      </section>

      {courseAnalytics && (
        <>
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Course Details</h2>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <AnalyticsCard label="Enrollments" value={courseAnalytics.totalEnrollments} />
              <AnalyticsCard label="Active Students" value={courseAnalytics.activeStudents} />
              <AnalyticsCard label="Completion Rate" value={`${courseAnalytics.completionRate}%`} />
              <AnalyticsCard label="Avg Grade" value={courseAnalytics.averageGrade !== null ? `${courseAnalytics.averageGrade}%` : 'N/A'} />
              {courseAnalytics.mostDifficultQuiz && (
                <AnalyticsCard label="Hardest Quiz" value={`${courseAnalytics.mostDifficultQuiz.quizTitle} (${courseAnalytics.mostDifficultQuiz.averageScore}%)`} />
              )}
            </div>
          </section>

          <section style={{ marginBottom: '32px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
            <CompletionChart modules={courseAnalytics.moduleCompletions} />
          </section>

          <section style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
            <AtRiskStudentsList students={courseAnalytics.atRiskStudents} />
          </section>
        </>
      )}

      {!courseAnalytics && courses.length === 0 && (
        <p style={{ color: '#6b7280' }}>No courses found. Create a course to see analytics.</p>
      )}
    </div>
  )
}
