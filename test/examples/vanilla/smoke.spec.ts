/**
 * Smoke tests — scope: all example pages
 *
 * Checks that every page:
 *   1. Loads without uncaught JS errors
 *   2. Has all media-* custom elements properly registered
 *
 * This is the fastest / widest safety net. A failure here means a broken
 * import or missing component registration — the most common regression type.
 */
import { test, expect } from 'playwright/test';
import { findHtmlFiles, EXAMPLES_DIR } from './helpers.js';

const htmlFiles = findHtmlFiles(EXAMPLES_DIR);

for (const relPath of htmlFiles) {
  test(`vanilla/${relPath} - custom elements registered`, async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto(`/examples/vanilla/${relPath}`, { waitUntil: 'load' });

    const undefinedElements = await page.evaluate(() => {
      const tagNames = new Set(
        [...document.querySelectorAll('*')]
          .map((el) => el.tagName.toLowerCase())
          .filter((tag) => tag.startsWith('media-'))
      );
      return [...tagNames].filter((tag) => !customElements.get(tag));
    });

    expect(
      undefinedElements,
      `Unregistered custom elements: ${undefinedElements.join(', ')}`
    ).toHaveLength(0);

    expect(pageErrors, `Page errors: ${pageErrors.join('; ')}`).toHaveLength(0);
  });
}
