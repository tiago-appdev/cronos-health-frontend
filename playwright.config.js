import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	// Test directory
	testDir: "./src/tests/e2e",

	// Run tests in files in parallel
	fullyParallel: true,

	// Fail the build on CI if you accidentally left test.only in the source code
	forbidOnly: !!process.env.CI,

	// Retry on CI only
	retries: process.env.CI ? 2 : 0,

	// Opt out of parallel tests on CI
	//   workers: process.env.CI ? 1 : undefined,
	workers: 1,

	// Reporter to use
	reporter: [
		["html"],
		["list"],
		["junit", { outputFile: "test-results/junit.xml" }],
	],

	// Shared settings for all the projects below
	use: {
		// Base URL to use in actions like `await page.goto('/')`
		baseURL: "http://localhost:3000",

		// Collect trace when retrying the failed test
		trace: "on-first-retry",

		// Record video on failure
		video: "retain-on-failure",

		// Take screenshot on failure
		screenshot: "only-on-failure",
	},

	// Configure projects for major browsers
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
		},
		{
			name: "webkit",
			use: { ...devices["Desktop Safari"] },
		},
		// Mobile testing
		{
			name: "Mobile Chrome",
			use: { ...devices["Pixel 5"] },
		},
		{
			name: "Mobile Safari",
			use: { ...devices["iPhone 12"] },
		},
	],

	webServer: [
		{
			command: "npm run dev",
			port: 3000,
			reuseExistingServer: !process.env.CI,
		},
		{
			command: "npm run start:backend",
			port: 4000,
			reuseExistingServer: !process.env.CI,
		},
	],
});
