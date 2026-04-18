import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import config from '@/payload.config'
import { DashboardStatsService } from '@/services/dashboard-stats'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { EnrollmentChart } from '@/components/dashboard/EnrollmentChart'
import { GradesChart } from '@/components/dashboard/GradesChart'
import { AdminDashboardTables } from '@/components/dashboard/AdminDashboardTables'

type PayloadDoc = Record<string, unknown> & { id: string }

export default async function AdminDashboardPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/admin/login')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userWithRole = user as unknown as PayloadDoc & { role?: string }
  if (userWithRole.role && !['admin', 'editor', 'instructor'].includes(userWithRole.role)) {
    redirect('/dashboard')
  }

  const service = new DashboardStatsService(payload)

  const [summary, enrollmentTrends, gradeDistribution, courses, users, recentEnrollments] =
    await Promise.all([
      service.getSummary(),
      service.getEnrollmentTrends(),
      service.getGradeDistribution(),
      service.getCourses(10, 1),
      service.getUsers(10, 1),
      service.getRecentEnrollments(10, 1),
    ])

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#111827' }}>
          Admin Dashboard
        </h1>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>
          Platform overview and analytics
        </p>
      </div>

      {/* Summary stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <StatsCard label="Total Courses" value={summary.totalCourses} subtext="All courses" />
        <StatsCard label="Total Enrollments" value={summary.totalEnrollments} subtext="All time" />
        <StatsCard
          label="Total Users"
          value={summary.totalUsers}
          subtext="Platform members"
        />
        <StatsCard
          label="Completion Rate"
          value={`${summary.completionRate}%`}
          subtext="Completed enrollments"
          trend="up"
        />
      </div>

      {/* Charts row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: 24,
          marginBottom: 32,
        }}
      >
        {/* Enrollment Trends */}
        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: 20,
            backgroundColor: '#fff',
          }}
        >
          <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#111827' }}>
            Enrollment Trends
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>
            Monthly enrollments over the last 12 months
          </p>
          <EnrollmentChart data={enrollmentTrends} />
        </div>

        {/* Grade Distribution */}
        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: 20,
            backgroundColor: '#fff',
          }}
        >
          <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#111827' }}>
            Grade Distribution
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>
            Score breakdown of graded submissions
          </p>
          {summary.averageGrade !== null ? (
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>
                Average grade:{' '}
                <strong style={{ color: '#111827' }}>{summary.averageGrade}%</strong>
              </span>
            </div>
          ) : null}
          <GradesChart data={gradeDistribution} />
        </div>
      </div>

      {/* Data tables */}
      <div>
        <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600, color: '#111827' }}>
          Data Explorer
        </h2>
        <AdminDashboardTables
          courses={courses}
          users={users}
          enrollments={recentEnrollments}
          enrollmentTrends={enrollmentTrends}
          gradeDistribution={gradeDistribution}
          onCoursesPageChange={async (page) => service.getCourses(10, page)}
          onUsersPageChange={async (page) => service.getUsers(10, page)}
          onEnrollmentsPageChange={async (page) => service.getRecentEnrollments(10, page)}
        />
      </div>
    </div>
  )
}
