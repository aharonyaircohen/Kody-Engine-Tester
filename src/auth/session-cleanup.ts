import type { SessionStore } from './session-store'

export function cleanExpiredSessions(store: SessionStore, maxAgeMs: number): number {
  const now = Date.now()
  let count = 0

  // SessionStore stores sessions in a private Map, so we need to iterate via getAllSessions if available
  // or use the public API. Since SessionStore doesn't expose a way to list all sessions directly,
  // we use the cleanup pattern from session-store.ts:119-126 but based on createdAt age.
  // However, SessionStore only exposes revoke() which requires knowing session IDs.
  // The existing cleanup() method shows the pattern but doesn't expose session enumeration.
  // For this utility, we delegate to the store's cleanup capability.

  // Since SessionStore.cleanup() removes sessions based on expiresAt/refreshExpiresAt,
  // and we need to clean based on createdAt age, we need a different approach.
  // We iterate by revoking sessions we can identify as expired.

  const sessions = store.getAllSessions()
  for (const session of sessions) {
    const age = now - session.createdAt.getTime()
    if (age > maxAgeMs) {
      store.revoke(session.id)
      count++
    }
  }

  return count
}