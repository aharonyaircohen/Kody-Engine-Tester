import type { SessionStore } from './session-store'

export function cleanExpiredSessions(store: SessionStore, maxAgeMs: number): number {
  const cutoff = Date.now() - maxAgeMs
  let removed = 0

  for (const session of Array.from(store['sessions'].values())) {
    if (session.createdAt.getTime() < cutoff) {
      store.revoke(session.id)
      removed++
    }
  }

  return removed
}
