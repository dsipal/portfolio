import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * Smoke tests against a production build served with mock Strapi content.
 * Build first, with the mock running:
 *   node test/mock-strapi.mjs & STRAPI_INTERNAL_URL=http://localhost:1338 yarn build
 * Set PW_CHANNEL=msedge (or chrome) to use an installed browser locally.
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: process.env.PW_CHANNEL,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: process.env.PW_CHANNEL } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: process.env.PW_CHANNEL } },
  ],
  webServer: [
    {
      command: "node test/mock-strapi.mjs 1338",
      port: 1338,
      reuseExistingServer: true,
    },
    {
      command: `npx next start -p ${PORT}`,
      port: PORT,
      reuseExistingServer: !process.env.CI,
      env: { STRAPI_INTERNAL_URL: "http://localhost:1338", REVALIDATE_SECRET: "e2e-secret" },
    },
  ],
});
