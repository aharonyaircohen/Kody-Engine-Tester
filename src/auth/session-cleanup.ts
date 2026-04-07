import type { SessionStore } from './session-store'

/**
 * Removes sessions older than maxAgeMs based on their createdAt timestamp.
 * @param store - The SessionStore to clean up
 * @param maxAgeMs - Maximum age in milliseconds; sessions older than this are removed
 * @returns The number of sessions removed
 */
export function cleanExpiredSessions(store: SessionStore, maxAgeMs: number): number {
  const now = Date.now()
  let removedCount = 0

  for (const session of Array.from(store['sessions'].values())) {
    if (now - session.createdAt.getTime() >= maxAgeMs) {
      store.revoke(session.id)
      removedCount++
    }
  }

  return removedCount
}