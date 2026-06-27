'use client'

import { useState, useEffect } from 'react'
import type { SummaryStats } from '@/utils/summarize'

type StatsStatus = { kind: 'loading' } | { kind: 'error'; message: string } | { kind: 'success'; stats: SummaryStats }

interface StatsCardProps {
  lessonIds: string[]
  className?: string
}

export function StatsCard({ lessonIds, className }: StatsCardProps) {
  const [status, setStatus] = useState<StatsStatus>(() => {
    if (lessonIds.length === 0) {
      return { kind: 'success', stats: { mean: null, median: null, mode: null, stdDev: null, count: 0 } }
    }
    return { kind: 'loading' }
  })

  useEffect(() => {
    if (lessonIds.length === 0) return

    const idsParam = lessonIds.join(',')
    fetch(`/api/stats?ids=${encodeURIComponent(idsParam)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<SummaryStats>
      })
      .then((data) => {
        setStatus({ kind: 'success', stats: data })
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err)
        setStatus({ kind: 'error', message })
      })
  }, [lessonIds])

  if (status.kind === 'loading') return <div className={className}>Loading...</div>
  if (status.kind === 'error') return <div className={className}>Error: {status.message}</div>

  const stats = status.stats

  return (
    <div
      className={className}
      style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}
    >
      <h3>Lesson Completion Stats</h3>
      <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 16px' }}>
        {(
          [
            ['Mean', stats.mean],
            ['Median', stats.median],
            ['Mode', stats.mode],
            ['Std Dev', stats.stdDev],
            ['Count', stats.count],
          ] as const
        ).map(([label, value]) => (
          <div key={label} style={{ display: 'contents' }}>
            <dt style={{ fontWeight: 500 }}>{label}</dt>
            <dd style={{ margin: 0 }}>
              {value === null ? '—' : typeof value === 'number' ? value.toFixed(2) : String(value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
