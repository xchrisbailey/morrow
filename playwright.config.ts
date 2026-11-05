import { defineConfig, devices } from "@playwright/test";

// Smoke test against the production build (`pnpm build` first). global-setup
// starts `node .output/server/index.mjs` with a temporary MORROW_DATA_DIR.
export const E2E_PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${E2E_PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
