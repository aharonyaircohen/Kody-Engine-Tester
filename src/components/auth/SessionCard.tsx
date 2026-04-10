export interface TokenInfo {
  token: string
  createdAt: Date
  generation: number
}

interface Props {
  session: TokenInfo
  isCurrentSession?: boolean
  onRevoke: (token: string) => void
}

export function SessionCard({ session, isCurrentSession, onRevoke }: Props) {
  return (
    <div style={{
      border: `1px solid ${isCurrentSession ? '#3b82f6' : '#e5e7eb'}`,
      borderRadius: 8,
      padding: 16,
      marginBottom: 8,
    }}>
      <div><strong>Token:</strong> {session.token.substring(0, 20)}...</div>
      <div><strong>Created:</strong> {session.createdAt.toLocaleString()}</div>
      <div><strong>Generation:</strong> {session.generation}</div>
      {isCurrentSession && <span style={{ color: '#3b82f6', fontSize: 12 }}>(Current session)</span>}
      <button
        onClick={() => onRevoke(session.token)}
        disabled={isCurrentSession}
        style={{ marginTop: 8, padding: '4px 12px', color: '#ef4444' }}
      >
        Revoke
      </button>
    </div>
  )
}