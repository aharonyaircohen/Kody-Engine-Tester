'use client'

import { useState, useEffect } from 'react'
import { StatsChart } from './StatsChart'
import { UsersTable, type AdminUser } from './UsersTable'

interface AdminDashboardClientProps {
  initialUsers: AdminUser[]
  initialTotal: number
}

export function AdminDashboardClient({ initialUsers, initialTotal }: AdminDashboardClientProps) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [totalUsers, setTotalUsers] = useState(initialTotal)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const pageSize = 10

  const fetchUsers = async (page: number) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/dashboard/admin-stats?page=${page}&limit=${pageSize}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
        setTotalUsers(data.totalUsers || 0)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(currentPage)
  }, [currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Calculate role distribution for chart
  const roleDistribution = users.reduce<Record<string, number>>((acc, user) => {
    const role = user.role || 'unknown'
    acc[role] = (acc[role] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(roleDistribution).map(([label, value]) => ({
    label,
    value,
    color: label === 'admin' ? '#6c63ff' : label === 'student' ? '#4ade80' : '#f59e0b',
  }))

  // Calculate status distribution
  const activeCount = users.filter((u) => u.isActive).length
  const inactiveCount = users.length - activeCount

  return (
    <div>
      {/* Stats Charts Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatsChart
          data={[
            { label: 'Active', value: activeCount, color: '#4ade80' },
            { label: 'Inactive', value: inactiveCount, color: '#f87171' },
          ]}
          title="User Status"
        />
        <StatsChart
          data={chartData.length > 0 ? chartData : [{ label: 'No Data', value: 0, color: '#6c63ff' }]}
          title="Users by Role"
        />
      </div>

      {/* Users Table */}
      <UsersTable
        users={users}
        totalUsers={totalUsers}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />

      {loading && (
        <div style={{ textAlign: 'center', padding: 16, color: '#a0a0c0' }}>
          Loading...
        </div>
      )}
    </div>
  )
}