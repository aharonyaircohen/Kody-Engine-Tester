import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import type { CollectionSlug } from 'payload'
import config from '@/payload.config'
import { BarChart } from '@/components/dashboard/BarChart'
import type { BarChartData } from '@/components/dashboard/BarChart'
import { DataTable } from '@/components/dashboard/DataTable'
import type { Column } from '@/components/dashboard/DataTable'

type PayloadDoc = Record<string, unknown> & { id: string }
type EnrollmentDoc = PayloadDoc & {
  course: { id: string; title?: string; estimatedHours?: number } | string
  completedLessons?: Array<string | { id: string }>
}
type CourseDoc = PayloadDoc & {
  title: string
  estimatedHours?: number
  difficulty?: string
}

export default async function AnalyticsPage() {
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

  // Fetch enrollments
  const { docs: enrollments } = await payload.find({
    collection: 'enrollments' as CollectionSlug,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: { student: { equals: user.id }, status: { not_equals: 'dropped' } } as any,
    depth: 1,
  })

  const typedEnrollments = enrollments as unknown as EnrollmentDoc[]

  // Build chart data: courses by estimated hours
  const chartData: BarChartData[] = typedEnrollments.map((e) => {
    const course =
      typeof e.course === 'object' ? (e.course as CourseDoc) : null
    return {
      label: course?.title?.substring(0, 10) ?? 'Unknown',
      value: course?.estimatedHours ?? 0,
    }
  })

  // Build table data: enrollment details
  type EnrollmentRow = {
    id: string
    courseTitle: string
    status: string
    completedLessons: number
    totalLessons: number
  }

  const tableData: EnrollmentRow[] = typedEnrollments.map((e) => {
    const course =
      typeof e.course === 'object' ? (e.course as CourseDoc) : null
    const completedCount = (e.completedLessons ?? []).length
    return {
      id: e.id,
      courseTitle: course?.title ?? 'Unknown Course',
      status: 'active',
      completedLessons: completedCount,
      totalLessons: 10, // placeholder
    }
  })

  const columns: Column<EnrollmentRow>[] = [
    { key: 'courseTitle', header: 'Course' },
    { key: 'status', header: 'Status' },
    {
      key: 'completedLessons',
      header: 'Completed',
      render: (row) => `${row.completedLessons}/${row.totalLessons}`,
    },
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <h1>Analytics Dashboard</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: 24,
          marginBottom: 32,
        }}
      >
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <h3>Course Hours</h3>
          <BarChart data={chartData} />
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <h3>Quick Stats</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p>
              <strong>Enrolled Courses:</strong> {typedEnrollments.length}
            </p>
            <p>
              <strong>Total Hours:</strong>{' '}
              {chartData.reduce((sum, d) => sum + d.value, 0)}
            </p>
          </div>
        </div>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
        <h3>Enrollment Details</h3>
        <DataTable columns={columns} data={tableData} />
      </div>
    </div>
  )
}
