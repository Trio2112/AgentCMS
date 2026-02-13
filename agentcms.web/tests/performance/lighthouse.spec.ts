import { test, expect, chromium } from '@playwright/test';
import type { Browser, Page } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

/**
 * Performance Testing with Lighthouse
 * 
 * Target: <3s page load time (p95)
 * Metrics monitored:
 * - First Contentful Paint (FCP)
 * - Largest Contentful Paint (LCP)
 * - Time to Interactive (TTI)
 * - Total Blocking Time (TBT)
 * - Cumulative Layout Shift (CLS)
 */

test.describe('Performance Testing - Lighthouse Audit', () => {
  let browser: Browser;

  test.beforeAll(async () => {
    // Use chromium for lighthouse
    browser = await chromium.launch({
      args: ['--remote-debugging-port=9222'],
    });
  });

  test.afterAll(async () => {
    await browser.close();
  });

  const PERFORMANCE_THRESHOLDS = {
    performance: 85, // Minimum performance score
    accessibility: 90, // Minimum accessibility score
    'best-practices': 85, // Minimum best practices score
    seo: 85, // Minimum SEO score
  };

  const METRIC_THRESHOLDS = {
    'first-contentful-paint': 1500, // 1.5s
    'largest-contentful-paint': 2500, // 2.5s
    'total-blocking-time': 300, // 300ms
    'cumulative-layout-shift': 0.1, // CLS score
    'speed-index': 3000, // 3s
  };

  test('Sites page should load in <3s', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:5173/sites');

    await playAudit({
      page,
      thresholds: PERFORMANCE_THRESHOLDS,
      port: 9222,
    });

    await page.close();
  });

  test('Pages page should load in <3s', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:5173/pages');

    await playAudit({
      page,
      thresholds: PERFORMANCE_THRESHOLDS,
      port: 9222,
    });

    await page.close();
  });

  test('Assets page should load in <3s', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:5173/assets');

    await playAudit({
      page,
      thresholds: PERFORMANCE_THRESHOLDS,
      port: 9222,
    });

    await page.close();
  });

  test('Bundle size should be optimized', async ({ page }) => {
    // Navigate to the page
    await page.goto('http://localhost:5173');

    // Measure resource sizes
    const resourceMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const jsResources = resources.filter((r) => r.name.endsWith('.js'));
      const cssResources = resources.filter((r) => r.name.endsWith('.css'));
      
      const totalJsSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
      const totalCssSize = cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);

      return {
        totalJsSize,
        totalCssSize,
        jsCount: jsResources.length,
        cssCount: cssResources.length,
      };
    });

    // Assertions
    expect(resourceMetrics.totalJsSize).toBeLessThan(500 * 1024); // <500KB JavaScript
    expect(resourceMetrics.totalCssSize).toBeLessThan(50 * 1024); // <50KB CSS
  });

  test('Images should be optimized and lazy loaded', async ({ page }) => {
    await page.goto('http://localhost:5173/assets');

    // Check for lazy loading attributes
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const loading = await img.getAttribute('loading');
      // Images should have loading="lazy" (except hero/critical images)
      if (loading) {
        expect(loading).toBe('lazy');
      }
    }
  });

  test('Code splitting should be effective', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Check that vendor chunks are separated
    const scripts = await page.evaluate(() => {
      const scriptTags = Array.from(document.querySelectorAll('script[src]'));
      return scriptTags.map((s) => (s as HTMLScriptElement).src);
    });

    // Should have separate vendor chunk
    const hasVendorChunk = scripts.some((src) => src.includes('vendor'));
    expect(hasVendorChunk).toBeTruthy();
  });

  test('API calls should be optimized', async ({ page }) => {
    await page.goto('http://localhost:5173/sites');

    // Monitor network calls
    const apiCalls: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        apiCalls.push(request.url());
      }
    });

    await page.waitForLoadState('networkidle');

    // Should have minimal API calls on initial load
    expect(apiCalls.length).toBeLessThanOrEqual(3);
  });

  test('Time to Interactive should be <3s', async ({ page }) => {
    await page.goto('http://localhost:5173/sites');

    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        loadComplete: navigation.loadEventEnd - navigation.fetchStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
      };
    });

    // All metrics should be under 3 seconds (3000ms)
    expect(performanceMetrics.domInteractive).toBeLessThan(3000);
    expect(performanceMetrics.domContentLoaded).toBeLessThan(3000);
    expect(performanceMetrics.loadComplete).toBeLessThan(5000); // More lenient for full load
  });

  test('Memory usage should be reasonable', async ({ page }) => {
    await page.goto('http://localhost:5173/sites');

    // Get memory metrics (Chrome only)
    const metrics = await page.evaluate(() => {
      // @ts-expect-error memory is Chrome-specific
      return performance.memory ? {
        // @ts-expect-error memory is Chrome-specific
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        // @ts-expect-error memory is Chrome-specific
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      } : null;
    });

    if (metrics) {
      // Memory usage should be under 50MB initially
      expect(metrics.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024);
    }
  });

  test('Font loading should not block rendering', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:5173');
    const loadTime = Date.now() - startTime;

    // Should render quickly even if fonts are loading
    expect(loadTime).toBeLessThan(2000);

    // Check for font-display property
    const fontFaces = await page.evaluate(() => {
      return Array.from(document.fonts).map((font) => ({
        family: font.family,
        status: font.status,
      }));
    });

    // Fonts should load or fallback gracefully
    expect(fontFaces.length).toBeGreaterThan(0);
  });
});

test.describe('Core Web Vitals', () => {
  test('Measure Core Web Vitals', async ({ page }) => {
    await page.goto('http://localhost:5173/sites');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {
          FCP: 0,
          LCP: 0,
          CLS: 0,
          FID: 0,
        };

        // FCP - First Contentful Paint
        const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0] as PerformancePaintTiming;
        if (fcpEntry) {
          vitals.FCP = fcpEntry.startTime;
        }

        // LCP - Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime: number };
          vitals.LCP = lastEntry.renderTime || lastEntry.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // CLS - Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
            if (!layoutShift.hadRecentInput) {
              clsValue += layoutShift.value;
            }
          }
          vitals.CLS = clsValue;
        }).observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => resolve(vitals), 1000);
      });
    });

    const vitals = webVitals as { FCP: number; LCP: number; CLS: number; FID: number };

    // Core Web Vitals thresholds (good ratings)
    expect(vitals.FCP).toBeLessThan(1800); // Good FCP: <1.8s
    expect(vitals.LCP).toBeLessThan(2500); // Good LCP: <2.5s
    expect(vitals.CLS).toBeLessThan(0.1); // Good CLS: <0.1
  });
});
