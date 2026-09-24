import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testMatch: ["./tests", "**/*.test.ts"],
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only.
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: "html",

  use: {
    screenshot: "only-on-failure",
    video: "on",
    trace: "on-first-retry",
  },
  // Configure projects for major browsers.
  projects: [
    {
      name: "setup db",
      testMatch: /global\.setup\.ts/,
      teardown: "cleanup db",
    },
    {
      name: "cleanup db",
      testMatch: /global\.teardown\.ts/,
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup db"],
    },
  ],
  // Run your local dev server before starting the tests.
  webServer: [
    {
      command: "pnpm --filter learning-app-admin dev",
      url: "http://localhost:3008",
      reuseExistingServer: false,
      env: {
        DATABASE_URL: "postgresql://postgres:postgres@localhost:5439/test",
      },
    },
    {
      command: "pnpm --filter learning-app dev",
      url: "http://localhost:3007",
      reuseExistingServer: false,
      env: {
        DATABASE_URL: "postgresql://postgres:postgres@localhost:5439/test",
      },
    },
  ],
})
