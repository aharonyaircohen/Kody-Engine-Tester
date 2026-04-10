import type { SessionStore } from './session-store'

/**
 * Removes sessions that have exceeded the maximum age threshold.
 * A session is considered expired when `createdAt + maxAgeMs < now`.
 *
 * @param store - The SessionStore instance to clean up
 * @param maxAgeMs - Maximum age in milliseconds for a session to be considered valid
 * @returns The number of sessions that were removed
 */
export function cleanExpiredSessions(store: SessionStore, maxAgeMs: number): number {
  const now = Date.now()
  let removedCount = 0

  // SessionStore uses private fields, so we need to iterate via a workaround
  // We access the sessions Map directly through the store's internal state
  const sessions = store['sessions'] as Map<string, { id: string; createdAt: Date }>

  for (const [sessionId, session] of sessions) {
    if (session.createdAt.getTime() + maxAgeMs < now) {
      store.revoke(sessionId)
      removedCount++
    }
  }

  return removedCount
}