import { defineConfig, devices } from 'playwright/test';

const VANILLA_PORT = 4567;
const VITE_PORT = 4568;
const NEXT_PORT = 4569;

export default defineConfig({
  testDir: './examples',
  retries: 2,
  testIgnore: process.env.FEATURE_TESTS ? [] : ['**/features/**'],

  webServer: [
    {
      command: `npm run serve:test -- -p ${VANILLA_PORT}`,
      url: `http://localhost:${VANILLA_PORT}`,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `cd ../examples/vite-react-with-typescript && npx vite --port ${VITE_PORT}`,
      url: `http://localhost:${VITE_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: `cd ../examples/nextjs-with-typescript && npx next dev -p ${NEXT_PORT}`,
      url: `http://localhost:${NEXT_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],

  use: {
    baseURL: `http://localhost:${VANILLA_PORT}`,
    screenshot: "only-on-failure",
    video: "off",
    trace: "retain-on-failure",
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
