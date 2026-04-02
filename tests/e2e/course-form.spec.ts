import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

test.describe('Course Creation Form', () => {
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

  test('renders course creation form with expected fields', async () => {
    await page.goto('http://localhost:3000/admin/collections/courses/create')

    await expect(page.locator('input[name="title"]')).toBeVisible()
    await expect(page.locator('input[name="slug"]')).toBeVisible()
    await expect(page.locator('[name="description"]')).toBeVisible()

    await page.screenshot({ path: 'tests/e2e/screenshots/course-form.png', fullPage: true })
  })
})
