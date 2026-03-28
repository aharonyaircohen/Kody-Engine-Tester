'use client'

import type { AtRiskStudent } from '@/services/analytics'

interface AtRiskStudentsListProps {
  students: AtRiskStudent[]
}

const reasonLabels: Record<AtRiskStudent['reason'], string> = {
  'low-progress': 'Low Progress',
  'low-grade': 'Low Grade',
  'both': 'Low Progress & Grade',
}

export function AtRiskStudentsList({ students }: AtRiskStudentsListProps) {
  if (students.length === 0) {
    return <p style={{ color: '#6b7280' }}>No at-risk students. Great job!</p>
  }

  return (
    <div>
      <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>Students at Risk</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
            <th style={{ padding: '8px' }}>Student</th>
            <th style={{ padding: '8px' }}>Progress</th>
            <th style={{ padding: '8px' }}>Avg Grade</th>
            <th style={{ padding: '8px' }}>Reason</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.studentId} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '8px' }}>{s.studentName}</td>
              <td style={{ padding: '8px' }}>{s.progressPercentage}%</td>
              <td style={{ padding: '8px' }}>{s.averageGrade !== null ? `${s.averageGrade}%` : 'N/A'}</td>
              <td style={{ padding: '8px' }}>
                <span style={{
                  background: s.reason === 'both' ? '#fef2f2' : s.reason === 'low-grade' ? '#fffbeb' : '#fef2f2',
                  color: s.reason === 'both' ? '#dc2626' : s.reason === 'low-grade' ? '#d97706' : '#dc2626',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}>
                  {reasonLabels[s.reason]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
