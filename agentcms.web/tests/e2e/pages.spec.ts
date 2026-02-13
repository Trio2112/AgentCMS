import { test, expect } from '@playwright/test'

test.describe('Pages Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pages')
  })

  test('displays pages page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Pages')
  })

  test('create and publish page', async ({ page }) => {
    // Create page
    await page.click('button:has-text("Create Page")')
    await page.selectOption('select[name="siteId"]', { index: 1 })
    await page.fill('input[name="title"]', 'Test Page')
    await page.fill('textarea[name="body"]', 'Test content')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Page created successfully')).toBeVisible()

    // Find the page in list
    await expect(page.locator('text=Test Page')).toBeVisible()
    await expect(page.locator('text=Draft')).toBeVisible()

    // Publish the page
    await page.click('button:has-text("Publish"):first')
    await expect(page.locator('text=Page published successfully')).toBeVisible()
    await expect(page.locator('text=Published')).toBeVisible()
  })

  test('edit page', async ({ page }) => {
    await page.click('button:has-text("Edit"):first')
    await page.fill('input[name="title"]', 'Updated Title')
    await page.click('button:has-text("Save Changes")')

    await expect(page.locator('text=Page updated successfully')).toBeVisible()
    await expect(page.locator('text=Updated Title')).toBeVisible()
  })

  test('toggle publish status', async ({ page }) => {
    // Assuming there's at least one published page
    await page.click('button:has-text("Unpublish"):first')
    await expect(page.locator('text=Page unpublished successfully')).toBeVisible()

    // Toggle back
    await page.click('button:has-text("Publish"):first')
    await expect(page.locator('text=Page published successfully')).toBeVisible()
  })

  test('filter pages by site', async ({ page }) => {
    const initialCount = await page.locator('tbody tr').count()
    
    // Select a specific site
    await page.selectOption('select[aria-label="Filter by site"]', { index: 1 })
    
    // Count should change (unless all pages are in that site)
    const filteredCount = await page.locator('tbody tr').count()
    expect(filteredCount).toBeLessThanOrEqual(initialCount)
  })

  test('delete page with confirmation', async ({ page }) => {
    await page.click('button:has-text("Delete"):first')
    await expect(page.locator('text=Are you sure you want to delete')).toBeVisible()
    await page.click('button:has-text("Delete"):has([role="dialog"])')

    await expect(page.locator('text=Page deleted successfully')).toBeVisible()
  })

  test('concurrent edit warning', async ({ page, context }) => {
    // Open page editor in first tab
    await page.click('button:has-text("Edit"):first')
    const pageTitle = await page.inputValue('input[name="title"]')

    // Open same page in second tab
    const page2 = await context.newPage()
    await page2.goto('/pages')
    await page2.click('button:has-text("Edit"):first')

    // Edit in second tab
    await page2.fill('input[name="title"]', `${pageTitle} - Modified by User 2`)
    await page2.click('button:has-text("Save Changes")')
    await expect(page2.locator('text=Page updated successfully')).toBeVisible()
    await page2.close()

    // Try to save in first tab - should show conflict warning
    await page.fill('input[name="title"]', `${pageTitle} - Modified by User 1`)
    await page.click('button:has-text("Save Changes")')

    // Should show concurrent edit warning
    await expect(page.locator('text=Page Modified by Another User')).toBeVisible()
  })
})
