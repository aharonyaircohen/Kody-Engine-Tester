import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import type { CollectionSlug } from 'payload'
import config from '@/payload.config'
import { AdminDashboardClient } from '@/components/admin-dashboard/AdminDashboardClient'

export default async function AdminDashboardPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/admin/login')
  }

  if (user.role !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch initial users for SSR
  const { docs: initialUsers, totalDocs } = await payload.find({
    collection: 'users' as CollectionSlug,
    limit: 10,
  })

  const safeUsers = initialUsers.map((u: any) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
  }))

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <h1 style={{ marginBottom: 24, color: '#e0e0e0' }}>Admin Dashboard</h1>
      <AdminDashboardClient
        initialUsers={safeUsers}
        initialTotal={totalDocs ?? initialUsers.length}
      />
    </div>
  )
}