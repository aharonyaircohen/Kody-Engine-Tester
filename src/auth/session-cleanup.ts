import type { SessionStore } from './session-store'

/**
 * Removes sessions older than maxAgeMs and returns the count of removed sessions.
 */
export function cleanExpiredSessions(store: SessionStore, maxAgeMs: number): number {
  const cutoff = Date.now() - maxAgeMs
  let count = 0
  for (const session of store.getAllSessions()) {
    if (session.createdAt.getTime() <= cutoff) {
      store.revoke(session.id)
      count++
    }
  }
  return count
}