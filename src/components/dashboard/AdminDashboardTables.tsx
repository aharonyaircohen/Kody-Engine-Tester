'use client'

import { useState } from 'react'
import { AdminDataTable } from './AdminDataTable'
import type { CourseRow, UserRow, EnrollmentRow, EnrollmentTrendPoint, GradeDistribution } from '@/services/dashboard-stats'

interface AdminDashboardTablesProps {
  courses: { docs: CourseRow[]; totalDocs: number }
  users: { docs: UserRow[]; totalDocs: number }
  enrollments: { docs: EnrollmentRow[]; totalDocs: number }
  enrollmentTrends: EnrollmentTrendPoint[]
  gradeDistribution: GradeDistribution[]
  onCoursesPageChange: (page: number) => Promise<{ docs: CourseRow[]; totalDocs: number }>
  onUsersPageChange: (page: number) => Promise<{ docs: UserRow[]; totalDocs: number }>
  onEnrollmentsPageChange: (page: number) => Promise<{ docs: EnrollmentRow[]; totalDocs: number }>
}

type Tab = 'courses' | 'users' | 'enrollments'

export function AdminDashboardTables({
  courses: initialCourses,
  users: initialUsers,
  enrollments: initialEnrollments,
  onCoursesPageChange,
  onUsersPageChange,
  onEnrollmentsPageChange,
}: AdminDashboardTablesProps) {
  const [activeTab, setActiveTab] = useState<Tab>('courses')
  const [courses, setCourses] = useState(initialCourses)
  const [users, setUsers] = useState(initialUsers)
  const [enrollments, setEnrollments] = useState(initialEnrollments)
  const [coursesPage, setCoursesPage] = useState(1)
  const [usersPage, setUsersPage] = useState(1)
  const [enrollmentsPage, setEnrollmentsPage] = useState(1)

  const courseColumns = [
    { key: 'title', header: 'Course Title', width: '40%' },
    { key: 'instructor', header: 'Instructor', width: '25%' },
    { key: 'enrollmentCount', header: 'Enrollments', width: '15%' },
    {
      key: 'status',
      header: 'Status',
      width: '20%',
      render: (row: CourseRow) => (
        <span
          style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 500,
            backgroundColor: row.status === 'published' ? '#dcfce7' : '#f3f4f6',
            color: row.status === 'published' ? '#166534' : '#6b7280',
          }}
        >
          {row.status}
        </span>
      ),
    },
  ]

  const userColumns = [
    { key: 'name', header: 'Name', width: '30%' },
    { key: 'email', header: 'Email', width: '35%' },
    {
      key: 'role',
      header: 'Role',
      width: '15%',
      render: (row: UserRow) => (
        <span
          style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 500,
            backgroundColor: '#eff6ff',
            color: '#1d4ed8',
          }}
        >
          {row.role}
        </span>
      ),
    },
    { key: 'enrollmentCount', header: 'Courses', width: '20%' },
  ]

  const enrollmentColumns = [
    { key: 'studentName', header: 'Student', width: '25%' },
    { key: 'courseTitle', header: 'Course', width: '30%' },
    {
      key: 'status',
      header: 'Status',
      width: '15%',
      render: (row: EnrollmentRow) => (
        <span
          style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 500,
            backgroundColor:
              row.status === 'completed'
                ? '#dcfce7'
                : row.status === 'active'
                  ? '#eff6ff'
                  : '#fef2f2',
            color:
              row.status === 'completed'
                ? '#166534'
                : row.status === 'active'
                  ? '#1d4ed8'
                  : '#991b1b',
          }}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: 'enrolledAt',
      header: 'Enrolled',
      width: '30%',
      render: (row: EnrollmentRow) =>
        row.enrolledAt
          ? new Date(row.enrolledAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
          : '—',
    },
  ]

  const tabs: { key: Tab; label: string }[] = [
    { key: 'courses', label: `Courses (${initialCourses.totalDocs})` },
    { key: 'users', label: `Users (${initialUsers.totalDocs})` },
    { key: 'enrollments', label: `Enrollments (${initialEnrollments.totalDocs})` },
  ]

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        backgroundColor: '#fff',
        overflow: 'hidden',
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #6366f1' : '2px solid transparent',
              backgroundColor: activeTab === tab.key ? '#fff' : 'transparent',
              color: activeTab === tab.key ? '#6366f1' : '#6b7280',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: activeTab === tab.key ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table content */}
      <div style={{ padding: 16 }}>
        {activeTab === 'courses' && (
          <AdminDataTable
            title="Courses"
            columns={courseColumns}
            rows={courses.docs}
            totalDocs={courses.totalDocs}
            page={coursesPage}
            limit={10}
            onPageChange={async (page) => {
              const result = await onCoursesPageChange(page)
              setCourses(result)
              setCoursesPage(page)
            }}
          />
        )}
        {activeTab === 'users' && (
          <AdminDataTable
            title="Users"
            columns={userColumns}
            rows={users.docs}
            totalDocs={users.totalDocs}
            page={usersPage}
            limit={10}
            onPageChange={async (page) => {
              const result = await onUsersPageChange(page)
              setUsers(result)
              setUsersPage(page)
            }}
          />
        )}
        {activeTab === 'enrollments' && (
          <AdminDataTable
            title="Enrollments"
            columns={enrollmentColumns}
            rows={enrollments.docs}
            totalDocs={enrollments.totalDocs}
            page={enrollmentsPage}
            limit={10}
            onPageChange={async (page) => {
              const result = await onEnrollmentsPageChange(page)
              setEnrollments(result)
              setEnrollmentsPage(page)
            }}
          />
        )}
      </div>
    </div>
  )
}
