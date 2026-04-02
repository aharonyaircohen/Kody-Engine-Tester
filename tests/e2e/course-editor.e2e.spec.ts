import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'
// The course editor uses in-memory stores so any course ID works for UI exploration
const COURSE_EDITOR_URL = `${BASE_URL}/instructor/courses/test-course-e2e/edit`

test.describe('Course Editor', () => {
  test('renders the edit course heading and add-module button', async ({ page }) => {
    await page.goto(COURSE_EDITOR_URL)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1').first()).toHaveText('Edit Course Content')
    await expect(page.getByTestId('add-module')).toBeVisible()
    await expect(page.getByTestId('add-module')).toHaveText('+ Add Module')
  })

  test('back link navigates to the course overview', async ({ page }) => {
    await page.goto(COURSE_EDITOR_URL)
    await page.waitForLoadState('networkidle')

    const backLink = page.locator('a', { hasText: 'Back to course' })
    await expect(backLink).toBeVisible()
    await expect(backLink).toHaveAttribute('href', '/instructor/courses/test-course-e2e')
  })

  test('publish toggle shows Draft badge initially and Publish button', async ({ page }) => {
    await page.goto(COURSE_EDITOR_URL)
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=Draft')).toBeVisible()
    await expect(page.getByTestId('publish-toggle-button')).toHaveText('Publish')
  })

  test('clicking Publish opens a confirmation dialog', async ({ page }) => {
    await page.goto(COURSE_EDITOR_URL)
    await page.waitForLoadState('networkidle')

    await page.getByTestId('publish-toggle-button').click()

    await expect(page.getByTestId('confirm-dialog')).toBeVisible()
    await expect(page.locator('h3', { hasText: 'Publish course?' })).toBeVisible()
    await expect(page.locator('text=The course will be visible to enrolled students.')).toBeVisible()
    await expect(page.getByTestId('cancel-button')).toBeVisible()
    await expect(page.getByTestId('confirm-button')).toBeVisible()
  })

  test('cancelling the publish dialog keeps status as Draft', async ({ page }) => {
    await page.goto(COURSE_EDITOR_URL)
    await page.waitForLoadState('networkidle')

    await page.getByTestId('publish-toggle-button').click()
    await expect(page.getByTestId('confirm-dialog')).toBeVisible()

    await page.getByTestId('cancel-button').click()

    await expect(page.getByTestId('confirm-dialog')).not.toBeVisible()
    await expect(page.locator('text=Draft')).toBeVisible()
    await expect(page.getByTestId('publish-toggle-button')).toHaveText('Publish')
  })

  test('confirming publish changes badge to Published and button to Unpublish', async ({
    page,
  }) => {
    await page.goto(COURSE_EDITOR_URL)
    await page.waitForLoadState('networkidle')

    await page.getByTestId('publish-toggle-button').click()
    await page.getByTestId('confirm-button').click()

    await expect(page.getByTestId('confirm-dialog')).not.toBeVisible()
    await expect(page.locator('text=Published')).toBeVisible()
    await expect(page.getByTestId('publish-toggle-button')).toHaveText('Unpublish')
  })

  test('adding a module renders a new module in the list', async ({ page }) => {
    await page.goto(COURSE_EDITOR_URL)
    await page.waitForLoadState('networkidle')

    const beforeCount = await page.getByTestId('module-item').count()

    await page.getByTestId('add-module').click()

    await expect(page.getByTestId('module-item')).toHaveCount(beforeCount + 1)
    await expect(page.getByTestId('module-title').last()).toHaveText('New Module')
  })

  test('adding a lesson to a module renders an Add Lesson button and lesson entry', async ({
    page,
  }) => {
    await page.goto(COURSE_EDITOR_URL)
    await page.waitForLoadState('networkidle')

    // Ensure at least one module exists
    await page.getByTestId('add-module').click()
    await expect(page.getByTestId('module-item').first()).toBeVisible()

    // Add a lesson to that module
    const addLessonBtn = page.getByTestId('add-lesson').first()
    await expect(addLessonBtn).toBeVisible()
    await addLessonBtn.click()

    // The lesson editor should now appear inside the module with title "New Lesson"
    await expect(page.getByTestId('lesson-editor').first()).toBeVisible()
    await expect(page.getByTestId('lesson-title').first()).toHaveText('New Lesson')
  })

  test('deleting a module removes it from the list', async ({ page }) => {
    await page.goto(COURSE_EDITOR_URL)
    await page.waitForLoadState('networkidle')

    // Add a module then delete it
    await page.getByTestId('add-module').click()
    const countAfterAdd = await page.getByTestId('module-item').count()

    await page.getByTestId('delete-module').last().click()

    await expect(page.getByTestId('module-item')).toHaveCount(countAfterAdd - 1)
  })
})
