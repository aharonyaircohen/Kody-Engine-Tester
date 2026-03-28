export type TrendDirection = 'up' | 'down' | 'neutral'

interface AnalyticsCardProps {
  label: string
  value: string | number
  trend?: TrendDirection
}

const trendSymbols: Record<TrendDirection, string> = {
  up: '\u2191',
  down: '\u2193',
  neutral: '\u2192',
}

const trendColors: Record<TrendDirection, string> = {
  up: '#16a34a',
  down: '#dc2626',
  neutral: '#6b7280',
}

export function AnalyticsCard({ label, value, trend }: AnalyticsCardProps) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', minWidth: '180px' }}>
      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
        <span style={{ fontSize: '28px', fontWeight: 700 }}>{value}</span>
        {trend && (
          <span style={{ fontSize: '18px', color: trendColors[trend] }} aria-label={`Trend: ${trend}`}>
            {trendSymbols[trend]}
          </span>
        )}
      </div>
    </div>
  )
}
