import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    serviceWorkers: "allow",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: process.env.PW_CHANNEL || undefined,
      },
    },
  ],
  webServer: {
    command: `pnpm exec next start -p ${PORT} -H 127.0.0.1`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
