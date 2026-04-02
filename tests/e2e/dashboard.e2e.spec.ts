import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

const BASE_URL = 'http://localhost:3000'

test.describe('Dashboard — unauthenticated', () => {
  test('redirects to admin login when not logged in', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForLoadState('networkidle')

    // Server-side redirect sends unauthenticated users to the admin login page
    await expect(page).toHaveURL(/\/admin\/login/)
    await expect(page.locator('#field-email')).toBeVisible()
  })
})

test.describe('Dashboard — authenticated student', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()
    const context = await browser.newContext()
    page = await context.newPage()
    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('shows "My Dashboard" heading', async () => {
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1').first()).toHaveText('My Dashboard')
  })

  test('shows empty enrollment message when user has no courses', async () => {
    await page.goto(`${BASE_URL}/dashboard`)
    await page.waitForLoadState('networkidle')

    await expect(
      page.locator('text=You are not enrolled in any courses yet.'),
    ).toBeVisible()
  })
})
