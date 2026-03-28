import type { ModuleCompletion } from '@/services/analytics'

interface CompletionChartProps {
  modules: ModuleCompletion[]
}

export function CompletionChart({ modules }: CompletionChartProps) {
  if (modules.length === 0) {
    return <p style={{ color: '#6b7280' }}>No modules to display.</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ margin: 0, fontSize: '16px' }}>Module Completion Rates</h3>
      {modules.map((mod) => (
        <div key={mod.moduleId}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
            <span>{mod.moduleTitle}</span>
            <span>{mod.completionRate}%</span>
          </div>
          <div style={{ background: '#e5e7eb', borderRadius: '4px', height: '20px', overflow: 'hidden' }}>
            <div
              style={{
                background: mod.completionRate >= 70 ? '#16a34a' : mod.completionRate >= 40 ? '#eab308' : '#dc2626',
                height: '100%',
                width: `${mod.completionRate}%`,
                borderRadius: '4px',
                transition: 'width 0.3s ease',
              }}
              role="progressbar"
              aria-valuenow={mod.completionRate}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${mod.moduleTitle}: ${mod.completionRate}% complete`}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
