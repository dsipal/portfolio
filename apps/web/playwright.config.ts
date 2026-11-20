import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * Smoke tests against a production build served with mock Ghost content.
 * Build first, with the mock running:
 *   node test/mock-ghost.mjs & GHOST_INTERNAL_URL=http://localhost:1338 GHOST_CONTENT_API_KEY=test pnpm exec next build
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
      command: "node test/mock-ghost.mjs 1338",
      port: 1338,
      reuseExistingServer: true,
    },
    {
      command: `npx next start -p ${PORT}`,
      port: PORT,
      reuseExistingServer: !process.env.CI,
      env: {
        GHOST_INTERNAL_URL: "http://localhost:1338",
        GHOST_CONTENT_API_KEY: "test",
        REVALIDATE_SECRET: "e2e-secret",
      },
    },
  ],
});
