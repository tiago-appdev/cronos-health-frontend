import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./",
  fullyParallel: false, // Sequential for data consistency
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid data conflicts
  reporter: [
    ["html"],
    ["list"],
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    headless: !!process.env.CI,
  },
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.js/,
    },
    {
      name: "auth-tests",
      testMatch: /auth\.spec\.js/,
      dependencies: ["setup"],
    },
    {
      name: "patient-tests",
      testMatch: /patient\.spec\.js/,
      dependencies: ["setup"],
    },
    {
      name: "doctor-tests",
      testMatch: /doctor\.spec\.js/,
      dependencies: ["setup"],
    },
    {
      name: "admin-tests",
      testMatch: /admin\.spec\.js/,
      dependencies: ["setup"],
    },
    {
      name: "integration-tests",
      testMatch: /integration\.spec\.js/,
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});