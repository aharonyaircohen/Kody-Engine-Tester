import { test, expect } from '@playwright/test'

test.describe('Analytics Dashboard', () => {
  test('shows analytics dashboard with charts and data table', async ({ page }) => {
    await page.goto('http://localhost:3000/analytics')

    await expect(page.locator('h1')).toHaveText('Analytics Dashboard')

    // Check that the page has chart section
    const chartSection = page.locator('text=Course Hours').first()
    await expect(chartSection).toBeVisible()

    // Check that the page has stats section
    const statsSection = page.locator('text=Quick Stats').first()
    await expect(statsSection).toBeVisible()

    // Check that the page has enrollment table
    const tableSection = page.locator('text=Enrollment Details').first()
    await expect(tableSection).toBeVisible()
  })
})
