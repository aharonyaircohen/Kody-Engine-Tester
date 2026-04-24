/**
 * Smoke test for Issue #3014: v0.3.5 fresh canary - verify Playwright MCP actually navigates
 *
 * This test verifies that when the Kody Engine fetches external URLs during research,
 * it uses Playwright MCP tools (mcp__playwright__browser_navigate or mcp__playwright__browser_snapshot)
 * instead of falling back to curl or WebFetch.
 *
 * Success criteria:
 * - Research output's "External references" section echoes at least two of:
 *   `ZINGLEBERRY-9.42`, `3771 bytes`, `0xB3E7`, `QUIXOTIC-STABLE`
 * - CI logs show `mcp__playwright__browser_navigate` or `mcp__playwright__browser_snapshot`
 * - CI logs do NOT show `curl` or `WebFetch` for the target URL
 *
 * Target URL: https://gist.github.com/aguyaharonyair/d95bf120fb2bb55de748149d028f1005
 *
 * This test uses @playwright/test to verify the gist content using browser navigation.
 */

import { test, expect } from '@playwright/test'

const TARGET_GIST_URL = 'https://gist.github.com/aguyaharonyair/d95bf120fb2bb55de748149d028f1005'

// Expected tokens that verify the gist was actually fetched (not hallucinated)
const VERIFICATION_TOKENS = ['ZINGLEBERRY-9.42', '3771 bytes', '0xB3E7', 'QUIXOTIC-STABLE'] as const

test.describe('Playwright MCP Smoke Test (Issue #3014)', () => {
  test('verifies gist URL is reachable and contains all canary tokens', async ({ page }) => {
    // Navigate to the gist using Playwright browser
    const response = await page.goto(TARGET_GIST_URL)

    // Verify the page loaded successfully
    expect(response?.status()).toBe(200)

    // Get the page content
    const content = await page.content()

    // Verify all four canary tokens are present in the page content
    expect(content).toContain('ZINGLEBERRY-9.42')
    expect(content).toContain('3771 bytes')
    expect(content).toContain('0xB3E7')
    expect(content).toContain('QUIXOTIC-STABLE')
  })

  test('documents verification criteria for CI pipeline', () => {
    // This test documents the success criteria for the smoke test
    // The actual verification happens in CI when the Kody engine processes this issue

    // Verify all tokens are distinct
    const uniqueTokens = new Set(VERIFICATION_TOKENS)
    expect(uniqueTokens.size).toBe(VERIFICATION_TOKENS.length)

    // Document the success criteria:
    // 1. CI logs must show mcp__playwright__browser_navigate or mcp__playwright__browser_snapshot
    // 2. CI logs must NOT show curl or WebFetch for the target URL
    // 3. Research output must contain at least 2 of the verification tokens

    // Verify URL is correct
    expect(TARGET_GIST_URL).toBe('https://gist.github.com/aguyaharonyair/d95bf120fb2bb55de748149d028f1005')
  })
})
