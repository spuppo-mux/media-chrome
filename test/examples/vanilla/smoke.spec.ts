import { test, expect } from 'playwright/test';
import { readdirSync, statSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXAMPLES_DIR = join(__dirname, '../../../examples/vanilla');

function findHtmlFiles(dir: string, base = dir): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...findHtmlFiles(fullPath, base));
    } else if (entry.endsWith('.html')) {
      files.push(relative(base, fullPath));
    }
  }
  return files.sort();
}

const htmlFiles = findHtmlFiles(EXAMPLES_DIR);

for (const relPath of htmlFiles) {
  test(`vanilla/${relPath} - custom elements registered`, async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto(`/examples/vanilla/${relPath}`, { waitUntil: 'load' });

    // Find all media-* custom elements present in the main document
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
