export interface Deadline {
  id: string
  title: string
  dueDate: string
  type: 'assignment' | 'quiz'
}

interface UpcomingDeadlinesProps {
  deadlines: Deadline[]
}

export function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  if (deadlines.length === 0) {
    return <p>No upcoming deadlines</p>
  }

  return (
    <div>
      <h3>Upcoming Deadlines</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {deadlines.map((d) => (
          <li key={d.id} style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
            <strong>{d.title}</strong>
            <span style={{ marginLeft: 8, fontSize: 14, color: '#6b7280' }}>
              {new Date(d.dueDate).toLocaleDateString('en-US')}
            </span>
            <span style={{ marginLeft: 8, fontSize: 12, textTransform: 'uppercase', color: '#9ca3af' }}>
              {d.type}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
