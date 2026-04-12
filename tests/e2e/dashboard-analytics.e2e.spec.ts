import { test, expect, Page } from '@playwright/test'

test.describe('Dashboard Analytics', () => {
  let _page: Page

  test.beforeAll(async ({ browser }, _testInfo) => {
    const context = await browser.newContext()
    _page = await context.newPage()
  })

  test('renders analytics page with chart and table', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/analytics')

    // Should show Course Analytics heading
    await expect(page.locator('h1').first()).toHaveText('Course Analytics')

    // Should have SVG chart elements
    const charts = page.locator('svg')
    await expect(charts.first()).toBeVisible()

    // Should have a table
    const table = page.locator('table')
    await expect(table).toBeVisible()

    // Should have table headers
    await expect(page.getByText('Student Name')).toBeVisible()
    await expect(page.getByText('Course')).toBeVisible()
    await expect(page.getByText('Grade')).toBeVisible()
  })
})
