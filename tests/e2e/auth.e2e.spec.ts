import { test, expect } from '@playwright/test'

test.describe('Auth - Unauthenticated Redirects', () => {
  test('redirects unauthenticated users from /admin to /admin/login', async ({ page }) => {
    await page.goto('http://localhost:3000/admin')
    await expect(page).toHaveURL('http://localhost:3000/admin/login')
  })

  test('shows login form with email and password fields', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/login')
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
  })
})
