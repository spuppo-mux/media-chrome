/**
 * Smoke tests — scope: React example pages
 *
 * Checks that every page:
 *   1. Loads without uncaught JS errors
 *   2. Renders non-empty content
 *   3. (react-wrappers only) media-* custom elements are registered
 */
import { test, expect } from 'playwright/test';

test.describe.configure({ mode: 'parallel' });

const VITE_PORT = 4568;
const NEXT_PORT = 4569;

type Route = { url: string; label: string; checkMediaElements?: true };

const ROUTES: Route[] = [
  {
    url: `http://localhost:${VITE_PORT}/`,
    label: 'vite-react',
  },
  {
    url: `http://localhost:${NEXT_PORT}/`,
    label: 'nextjs/index',
  },
  {
    url: `http://localhost:${NEXT_PORT}/react-wrappers`,
    label: 'nextjs/react-wrappers',
    checkMediaElements: true,
  },
  {
    url: `http://localhost:${NEXT_PORT}/media-store-hooks`,
    label: 'nextjs/media-store-hooks',
  },
  {
    url: `http://localhost:${NEXT_PORT}/material-ui-player-chrome`,
    label: 'nextjs/material-ui-player-chrome',
  },
];

for (const route of ROUTES) {
  test(`${route.label} - renders without errors`, async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto(route.url, { waitUntil: 'load' });

    const hasContent = await page.evaluate(
      () => document.body.innerHTML.trim().length > 0
    );
    expect(hasContent, 'Page body should have content').toBe(true);

    if (route.checkMediaElements) {
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
    }

    expect(pageErrors, `Page errors: ${pageErrors.join('; ')}`).toHaveLength(0);
  });
}
