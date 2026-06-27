import { test, expect } from '@playwright/test'

test.describe('Task Board', () => {
  test('should render the board page', async ({ page }) => {
    await page.goto('http://localhost:3000/board')
    await expect(page).toHaveURL('http://localhost:3000/board')
    await expect(page.getByRole('heading', { name: 'Task Board' })).toBeVisible()
  })

  test('should show three columns', async ({ page }) => {
    await page.goto('http://localhost:3000/board')
    await expect(page.getByText('Todo')).toBeVisible()
    await expect(page.getByText('In Progress')).toBeVisible()
    await expect(page.getByText('Done')).toBeVisible()
  })

  test('should open modal when Add Task is clicked', async ({ page }) => {
    await page.goto('http://localhost:3000/board')
    await page.getByRole('button', { name: '+ Add Task' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'New Task' })).toBeVisible()
  })

  test('should create a task and show it in the Todo column', async ({ page }) => {
    await page.goto('http://localhost:3000/board')
    await page.getByRole('button', { name: '+ Add Task' }).click()
    await page.getByLabel('Title').fill('My Test Task')
    await page.getByRole('button', { name: 'Create Task' }).click()
    await expect(page.getByText('My Test Task')).toBeVisible()
  })
})
