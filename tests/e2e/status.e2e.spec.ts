import { test, expect, Page } from '@playwright/test'

test.describe('Status', () => {
  let _page: Page

  test.beforeAll(async ({ browser }, _testInfo) => {
    const context = await browser.newContext()
    _page = await context.newPage()
  })

  test('status page returns 200 and shows green Operational badge', async ({ page }) => {
    const response = await page.goto('/status')
    expect(response?.status()).toBe(200)

    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()

    const badge = page.getByText('Operational')
    await expect(badge).toBeVisible()

    const bgColor = await badge.evaluate(el => window.getComputedStyle(el).backgroundColor)
    expect(bgColor).toBe('rgb(34, 197, 94)')
  })
})