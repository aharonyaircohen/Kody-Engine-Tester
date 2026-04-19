/**
 * Shared test utilities and mocks for discussions API routes.
 * Imported by all discussions route test files.
 */
import { discussionsStore } from '@/collections/Discussions'

export const TEST_USER = {
  id: 'test-user-123',
  email: 'testuser@example.com',
  role: 'admin' as const,
  firstName: 'Test',
  lastName: 'User',
  displayName: 'Test User',
  avatar: null,
  bio: null,
  organization: null,
  createdAt: new Date('2026-01-01'),
  lastLogin: null,
  isActive: true,
}

/** Clear all posts from the in-memory DiscussionsStore between tests. */
export function clearStore(): void {
  const all = discussionsStore.getAll()
  for (const post of all) {
    discussionsStore.delete(post.id)
  }
}
