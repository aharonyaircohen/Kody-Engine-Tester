'use client'

import { Pagination } from '@/components/contacts/Pagination'
import styles from './UsersTable.module.css'

export interface AdminUser {
  id: string
  email: string
  role: string
  isActive: boolean
}

interface UsersTableProps {
  users: AdminUser[]
  totalUsers: number
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function UsersTable({
  users,
  totalUsers,
  currentPage,
  pageSize,
  onPageChange,
}: UsersTableProps) {
  const totalPages = Math.ceil(totalUsers / pageSize)

  return (
    <div style={{ background: '#1a1a2e', borderRadius: 8, border: '1px solid #2a2a3d', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #2a2a3d' }}>
        <h3 style={{ margin: 0, color: '#e0e0e0', fontSize: '1rem' }}>
          Users ({totalUsers})
        </h3>
      </div>
      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Email</th>
              <th className={styles.th}>Role</th>
              <th className={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={3} className={styles.empty}>No users found</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className={styles.row}>
                  <td className={styles.td}>{user.email}</td>
                  <td className={styles.td}>
                    <span className={styles.badge}>{user.role}</span>
                  </td>
                  <td className={styles.td}>
                    <span className={`${styles.status} ${user.isActive ? styles.active : styles.inactive}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid #2a2a3d', display: 'flex', justifyContent: 'center' }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
}