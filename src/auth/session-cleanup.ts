import type { SessionStore } from './session-store'

export function cleanExpiredSessions(store: SessionStore, maxAgeMs: number): number {
  const now = Date.now()
  let count = 0

  for (const session of Array.from((store as unknown as { sessions: Map<string, { id: string; createdAt: Date }> }).sessions.values())) {
    const createdAtTime = session.createdAt?.getTime()
    const age = now - (Number.isNaN(createdAtTime) ? 0 : createdAtTime)
    if (age > maxAgeMs) {
      store.revoke(session.id)
      count++
    }
  }

  return count
}