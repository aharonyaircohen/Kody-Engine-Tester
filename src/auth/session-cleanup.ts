import type { SessionStore } from './session-store'

/**
 * Removes sessions older than maxAgeMs (based on createdAt) and returns count of removed sessions.
 */
export function cleanExpiredSessions(store: SessionStore, maxAgeMs: number): number {
  const now = Date.now()
  const sessions = store.getAll()
  let removed = 0

  for (const session of sessions) {
    const ageMs = now - session.createdAt.getTime()
    if (ageMs > maxAgeMs) {
      store.revoke(session.id)
      removed++
    }
  }

  return removed
}
