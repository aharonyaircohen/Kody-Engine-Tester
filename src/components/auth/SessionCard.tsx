import type { Session } from '../../auth/session-store'

interface Props {
  session: Session
  isCurrentSession?: boolean
  onRevoke: (sessionId: string) => void
}

export function SessionCard({ session, isCurrentSession, onRevoke }: Props) {
  return (
    <div style={{
      border: `1px solid ${isCurrentSession ? '#3b82f6' : '#e5e7eb'}`,
      borderRadius: 8,
      padding: 16,
      marginBottom: 8,
    }}>
      <div><strong>IP:</strong> {session.ipAddress}</div>
      <div><strong>Device:</strong> {session.userAgent}</div>
      <div><strong>Created:</strong> {session.createdAt.toLocaleString()}</div>
      {isCurrentSession && <span style={{ color: '#3b82f6', fontSize: 12 }}>(Current session)</span>}
      <button
        onClick={() => onRevoke(session.id)}
        disabled={isCurrentSession}
        style={{ marginTop: 8, padding: '4px 12px', color: '#ef4444' }}
      >
        Revoke
      </button>
    </div>
  )
}
