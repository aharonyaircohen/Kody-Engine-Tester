'use client'

interface StatsCardProps {
  label: string
  value: string | number
  subtext?: string
  trend?: 'up' | 'down' | 'neutral'
}

export function StatsCard({ label, value, subtext, trend }: StatsCardProps) {
  const trendColor =
    trend === 'up' ? '#16a34a' : trend === 'down' ? '#dc2626' : '#6b7280'
  const trendIcon =
    trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: '16px 20px',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <span style={{ fontSize: 13, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>
          {value}
        </span>
        {trend && (
          <span style={{ fontSize: 14, color: trendColor, fontWeight: 600 }}>
            {trendIcon}
          </span>
        )}
      </div>
      {subtext && (
        <span style={{ fontSize: 12, color: '#9ca3af' }}>{subtext}</span>
      )}
    </div>
  )
}
