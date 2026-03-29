export interface NotesBadgeProps {
  count: number
}

export function NotesBadge({ count }: NotesBadgeProps) {
  return (
    <span
      data-testid="notes-badge"
      style={{
        background: '#333',
        color: '#aaa',
        padding: '2px 10px',
        borderRadius: '12px',
        fontSize: '0.8rem',
      }}
    >
      {count}
    </span>
  )
}
