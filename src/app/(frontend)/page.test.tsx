import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('HomePage Footer Copyright - Bug #3190', () => {
  const currentYear = new Date().getFullYear()

  describe('footer copyright year - repro for bug #3190', () => {
    it('should display the current calendar year in footer copyright', () => {
      // Bug #3190: Footer copyright year is hard-coded to 2024
      //
      // The footer should display the current year dynamically, not "© 2024"
      // Expected: "© 2026" (current year)
      // Buggy: "© 2024" (hardcoded stale year)

      const pagePath = resolve(__dirname, 'page.tsx')
      const pageContent = readFileSync(pagePath, 'utf-8')

      // Find the footer section
      const footerMatch = pageContent.match(/<div className="footer">[\s\S]*?<\/div>/)
      expect(footerMatch).not.toBeNull()

      const footerCode = footerMatch![0]

      // If footer contains a copyright, extract and verify the year
      const copyrightMatch = footerCode.match(/©\s*(\d{4})/)

      if (copyrightMatch) {
        // Copyright exists - verify it's the current year
        const displayedYear = parseInt(copyrightMatch[1], 10)
        expect(displayedYear).toBe(currentYear)
      } else {
        // No copyright found - this is the bug state (footer is missing copyright)
        // The footer should have a copyright with the current year
        expect(footerCode).toMatch(/©.*\$\{.*getFullYear.*\}/)
      }
    })

    it('should NOT contain hardcoded "© 2024" in the footer', () => {
      // Bug #3190: The footer contains hardcoded "© 2024" instead of
      // using dynamic year generation with `© ${new Date().getFullYear()}`

      const pagePath = resolve(__dirname, 'page.tsx')
      const pageContent = readFileSync(pagePath, 'utf-8')

      // Find the footer section
      const footerMatch = pageContent.match(/<div className="footer">[\s\S]*?<\/div>/)
      expect(footerMatch).not.toBeNull()

      const footerCode = footerMatch![0]

      // Bug check: The footer should NOT contain hardcoded "© 2024"
      expect(footerCode).not.toContain('© 2024')
    })

    it('should use dynamic year generation when displaying copyright', () => {
      // Bug #3190: Footer uses hardcoded "© 2024" instead of dynamic year
      // The correct implementation should use: `© ${new Date().getFullYear()}`

      const pagePath = resolve(__dirname, 'page.tsx')
      const pageContent = readFileSync(pagePath, 'utf-8')

      // Find the footer section
      const footerMatch = pageContent.match(/<div className="footer">[\s\S]*?<\/div>/)
      expect(footerMatch).not.toBeNull()

      const footerCode = footerMatch![0]

      // If footer has copyright symbol, it must use dynamic year generation
      if (footerCode.includes('©')) {
        // Must use getFullYear() or similar dynamic method
        expect(footerCode).toMatch(/\$\{new Date\(\)\.getFullYear\(\)\}/)
      } else {
        // No copyright - this is the bug state
        // Footer should have copyright with dynamic year generation
        expect(false).toBe(true)
      }
    })
  })
})
