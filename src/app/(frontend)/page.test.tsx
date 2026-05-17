import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

describe('Landing Page Welcome Text (Issue #3388)', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const pagePath = path.resolve(__dirname, './page.tsx')

  it('should display "Welcome, Kody-Engine Tester!" for non-logged-in users', () => {
    const sourceCode = readFileSync(pagePath, 'utf-8')

    // According to issue #3388, the landing page should display
    // "Welcome, Kody-Engine Tester!" for non-logged-in users
    expect(sourceCode).toContain('Welcome, Kody-Engine Tester!')
  })
})
