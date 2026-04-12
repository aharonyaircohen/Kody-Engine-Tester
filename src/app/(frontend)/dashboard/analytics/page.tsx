import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import type { CollectionSlug } from 'payload'
import config from '@/payload.config'
import { BarChart } from '@/components/dashboard/BarChart'
import { DataTable } from '@/components/dashboard/DataTable'

type PayloadDoc = Record<string, unknown> & { id: string }
type EnrollmentDoc = PayloadDoc

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

  // Fetch student enrollments for course metrics
  const { docs: enrollments } = await payload.find({
    collection: 'enrollments' as CollectionSlug,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: { student: { equals: user.id } } as any,
    depth: 1,
  })

  const typedEnrollments = enrollments as unknown as EnrollmentDoc[]
  const courseMetrics = typedEnrollments.slice(0, 7).map((e, i) => ({
    label: `Course ${i + 1}`,
    value: Math.floor(Math.random() * 100),
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'][i % 7],
  }))

  const studentMetrics = [
    { id: '1', name: 'Alice Johnson', course: 'Introduction to Programming', grade: 92 },
    { id: '2', name: 'Bob Smith', course: 'Advanced Mathematics', grade: 85 },
    { id: '3', name: 'Carol Williams', course: 'Physics 101', grade: 78 },
    { id: '4', name: 'David Brown', course: 'Introduction to Programming', grade: 95 },
    { id: '5', name: 'Eva Martinez', course: 'Chemistry Basics', grade: 88 },
  ]

  const columns = [
    { key: 'name', header: 'Student Name' },
    { key: 'course', header: 'Course' },
    {
      key: 'grade',
      header: 'Grade',
      render: (item: { grade: number }) => (
        <span style={{ fontWeight: item.grade >= 90 ? 'bold' : 'normal' }}>{item.grade}%</span>
      ),
    },
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <h1>Course Analytics</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Course Performance</h3>
          <BarChart data={courseMetrics} />
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Average Scores</h3>
          <BarChart
            data={courseMetrics.map((c) => ({ ...c, label: c.label.replace('Course ', 'C') }))}
          />
        </div>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Student Grades</h3>
        <DataTable columns={columns} data={studentMetrics} keyField="id" />
      </div>
    </div>
  )
}
