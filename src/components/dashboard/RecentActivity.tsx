export interface Activity {
  id: string
  description: string
  timestamp: string
}

interface RecentActivityProps {
  activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return <p>No recent activity</p>
  }

  return (
    <div>
      <h3>Recent Activity</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {activities.map((a) => (
          <li key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
            <span>{a.description}</span>
            <span style={{ marginLeft: 8, fontSize: 14, color: '#6b7280' }}>
              {new Date(a.timestamp).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
