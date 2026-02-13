import { test, expect } from '@playwright/test';
import AxeBuilder from 'axe-playwright';

test.describe('Accessibility Audit - WCAG 2.1 Level AA', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses to avoid backend dependencies
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      if (url.includes('/api/sites')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: '1', name: 'Test Site', domain: 'test.com', createdAt: new Date().toISOString() },
          ]),
        });
      } else if (url.includes('/api/pages')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: '1',
              siteId: '1',
              title: 'Test Page',
              body: 'Content',
              isPublished: true,
              createdAt: new Date().toISOString(),
            },
          ]),
        });
      } else if (url.includes('/api/assets')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: '1',
              siteId: '1',
              fileName: 'test.jpg',
              fileUrl: '/uploads/test.jpg',
              mimeType: 'image/jpeg',
              fileSize: 1024,
              uploadedBy: 'admin',
              uploadDate: new Date().toISOString(),
            },
          ]),
        });
      } else {
        await route.fulfill({ status: 200, body: '[]' });
      }
    });
  });

  test('Sites page should have no accessibility violations', async ({ page }) => {
    await page.goto('/sites');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Pages page should have no accessibility violations', async ({ page }) => {
    await page.goto('/pages');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Assets page should have no accessibility violations', async ({ page }) => {
    await page.goto('/assets');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Site creation modal should have no accessibility violations', async ({ page }) => {
    await page.goto('/sites');
    await page.waitForLoadState('networkidle');
    
    // Open create modal
    await page.getByRole('button', { name: /create site/i }).click();
    await page.waitForSelector('[role="dialog"]');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Page editor should have no accessibility violations', async ({ page }) => {
    await page.goto('/pages');
    await page.waitForLoadState('networkidle');
    
    // Open create page
    await page.getByRole('button', { name: /create page/i }).click();
    await page.waitForSelector('[role="dialog"]');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Asset upload modal should have no accessibility violations', async ({ page }) => {
    await page.goto('/assets');
    await page.waitForLoadState('networkidle');
    
    // Open upload modal
    await page.getByRole('button', { name: /upload asset/i }).click();
    await page.waitForSelector('[role="dialog"]');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Keyboard navigation should work on all interactive elements', async ({ page }) => {
    await page.goto('/sites');
    await page.waitForLoadState('networkidle');

    // Tab through interactive elements
    await page.keyboard.press('Tab'); // Skip to main content link
    await page.keyboard.press('Tab'); // Sites nav
    await page.keyboard.press('Tab'); // Pages nav
    await page.keyboard.press('Tab'); // Assets nav
    await page.keyboard.press('Tab'); // Create button
    
    // Check focus is visible
    const focusedElement = await page.evaluateHandle(() => document.activeElement);
    const focusedElementClass = await page.evaluate((el) => el?.className, focusedElement);
    
    // Should have visible focus styles (Tailwind focus:ring or focus:outline)
    expect(focusedElementClass).toMatch(/focus|ring|outline/);
  });

  test('Color contrast should meet WCAG AA standards', async ({ page }) => {
    await page.goto('/sites');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('.btn, .text, .heading') // Check buttons, text, and headings
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    );

    expect(contrastViolations).toEqual([]);
  });

  test('Form labels should be properly associated', async ({ page }) => {
    await page.goto('/sites');
    await page.waitForLoadState('networkidle');
    
    await page.getByRole('button', { name: /create site/i }).click();
    await page.waitForSelector('[role="dialog"]');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .include('form')
      .analyze();

    const labelViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'label' || v.id === 'label-title-only'
    );

    expect(labelViolations).toEqual([]);
  });

  test('Images should have alt text', async ({ page }) => {
    await page.goto('/assets');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .analyze();

    const imageViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'image-alt'
    );

    expect(imageViolations).toEqual([]);
  });
});
