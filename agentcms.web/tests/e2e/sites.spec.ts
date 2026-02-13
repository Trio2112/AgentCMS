import { test, expect } from '@playwright/test'

test.describe('Sites Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sites')
  })

  test('displays sites page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Sites')
  })

  test('create new site', async ({ page }) => {
    // Click create button
    await page.click('button:has-text("Create Site")')

    // Fill form
    await page.fill('input[name="name"]', 'Test Site')
    await page.fill('input[name="description"]', 'Test Description')

    // Submit form
    await page.click('button[type="submit"]')

    // Verify success message
    await expect(page.locator('text=Site created successfully')).toBeVisible()
  })

  test('edit existing site', async ({ page }) => {
    // Assuming at least one site exists, click edit on first site
    await page.click('button:has-text("Edit"):first')

    // Update name
    await page.fill('input[name="name"]', 'Updated Site Name')

    // Submit
    await page.click('button:has-text("Update Site")')

    // Verify success
    await expect(page.locator('text=Site updated successfully')).toBeVisible()
  })

  test('delete site with confirmation', async ({ page }) => {
    // Click delete on first site
    await page.click('button:has-text("Delete"):first')

    // Confirm deletion in dialog
    await expect(page.locator('text=Are you sure you want to delete')).toBeVisible()
    await page.click('button:has-text("Delete"):has([role="dialog"])')

    // Verify success
    await expect(page.locator('text=Site deleted successfully')).toBeVisible()
  })

  test('cancel site creation', async ({ page }) => {
    await page.click('button:has-text("Create Site")')
    await page.fill('input[name="name"]', 'Test Site')
    
    // Click cancel
    await page.click('button:has-text("Cancel")')

    // Modal should close
    await expect(page.locator('input[name="name"]')).not.toBeVisible()
  })

  test('validates required fields', async ({ page }) => {
    await page.click('button:has-text("Create Site")')

    // Try to submit without filling required field
    await page.click('button[type="submit"]')

    // Should show validation error
    await expect(page.locator('text=Site name is required')).toBeVisible()
  })
})
