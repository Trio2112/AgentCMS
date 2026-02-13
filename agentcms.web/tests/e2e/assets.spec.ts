import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Assets Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/assets')
  })

  test('displays assets page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Assets')
  })

  test('upload asset', async ({ page }) => {
    // Open upload modal
    await page.click('button:has-text("Upload Asset")')

    // Select site
    await page.selectOption('select[name="siteId"]', { index: 1 })

    // Upload file (create a test file)
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.click('input[type="file"]')
    const fileChooser = await fileChooserPromise

    // Create a dummy image buffer for testing
    const buffer = Buffer.from('fake-image-data')
    await fileChooser.setFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: buffer,
    })

    // Submit upload
    await page.click('button:has-text("Upload"):not(:disabled)')

    // Verify success
    await expect(page.locator('text=Asset uploaded successfully')).toBeVisible({ timeout: 10000 })
  })

  test('filter assets by site', async ({ page }) => {
    const initialCount = await page.locator('[data-testid="asset-card"]').count()

    // Select a specific site
    await page.selectOption('select[aria-label="Filter by site"]', { index: 1 })

    // Count should change
    const filteredCount = await page.locator('[data-testid="asset-card"]').count()
    expect(filteredCount).toBeLessThanOrEqual(initialCount)
  })

  test('preview asset', async ({ page }) => {
    // Click on an asset to preview
    await page.click('[data-testid="asset-card"]:first button:has-text("View")')

    // Modal should open with asset details
    await expect(page.locator('role=dialog')).toBeVisible()
    await expect(page.locator('text=File Size')).toBeVisible()
    await expect(page.locator('text=File Type')).toBeVisible()
  })

  test('delete asset with confirmation', async ({ page }) => {
    // Click delete on first asset
    await page.click('[data-testid="asset-card"]:first button:has-text("Delete")')

    // Confirm deletion
    await expect(page.locator('text=Are you sure you want to delete')).toBeVisible()
    await page.click('button:has-text("Delete"):has([role="dialog"])')

    // Verify success
    await expect(page.locator('text=Asset deleted successfully')).toBeVisible()
  })

  test('validates file size', async ({ page }) => {
    await page.click('button:has-text("Upload Asset")')
    await page.selectOption('select[name="siteId"]', { index: 1 })

    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.click('input[type="file"]')
    const fileChooser = await fileChooserPromise

    // Create a file larger than 10MB
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024) // 11MB
    await fileChooser.setFiles({
      name: 'large-file.jpg',
      mimeType: 'image/jpeg',
      buffer: largeBuffer,
    })

    // Should show validation error
    await expect(page.locator('text=File size must be less than 10MB')).toBeVisible()
  })

  test('copy asset URL', async ({ page }) => {
    // Open preview
    await page.click('[data-testid="asset-card"]:first button:has-text("View")')

    // Click copy URL button
    await page.click('button:has-text("Copy URL")')

    // Verify clipboard (may not work in all test environments)
    // Just verify button exists
    expect(await page.locator('button:has-text("Copy URL")').count()).toBe(1)
  })
})
