import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

test.describe('Admin Dashboard', () => {
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

  test('admin dashboard loads with heading or navigation', async () => {
    await page.goto('http://localhost:3000/admin')
    await expect(page).toHaveURL('http://localhost:3000/admin')

    const dashboardHeading = page.locator('span[title="Dashboard"]').first()
    await expect(dashboardHeading).toBeVisible()

    await page.screenshot({ path: 'tests/e2e/screenshots/admin-dashboard.png', fullPage: true })
  })

  test('admin navigation shows courses collection link', async () => {
    await page.goto('http://localhost:3000/admin')

    const coursesLink = page.locator('a[href*="/admin/collections/courses"]').first()
    await expect(coursesLink).toBeVisible()
  })

  test('admin navigation shows users collection link', async () => {
    await page.goto('http://localhost:3000/admin')

    const usersLink = page.locator('a[href*="/admin/collections/users"]').first()
    await expect(usersLink).toBeVisible()
  })
})
