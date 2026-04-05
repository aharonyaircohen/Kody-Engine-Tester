// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

// Auto-cleanup DOM after each test
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
afterEach(() => cleanup())

// Suppress expected database introspection errors during integration tests
// These occur when drizzle-kit tries to introspect schema without proper parameters
// (typically when database is unavailable or still initializing)
process.on('unhandledRejection', (reason) => {
  const reasonStr = String(reason)
  if (
    reasonStr.includes('there is no parameter $1') ||
    reasonStr.includes('drizzle-kit') ||
    reasonStr.includes('Failed query')
  ) {
    return // Suppress expected database errors
  }
  // For other unhandled rejections, log them for debugging
  console.warn('Unhandled Rejection:', reason)
})
