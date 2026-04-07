import { SessionStore } from './session-store'

export function cleanExpiredSessions(store: SessionStore, maxAgeMs: number): number {
  const cutoff = new Date(Date.now() - maxAgeMs)
  let count = 0

  for (const session of Array.from(store['sessions'].values())) {
    if (session.createdAt <= cutoff) {
      store.revoke(session.id)
      count++
    }
  }

  return count
}
