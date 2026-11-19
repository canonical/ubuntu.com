import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from "path";
 
dotenv.config({
    path:  path.join(__dirname, ".env.local")
});

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: path.join(__dirname, "tests/playwright/tests"),
  testIgnore: [
    '**\/pro/**',
    ...(process.env.INCLUDE_FORMS ? [] : ['**/forms/**']),
    // Canary submits real leads
    ...(process.env.INCLUDE_CANARY ? [] : ['**/canary/**']),
  ],
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  timeout: 60000,
  use: {
    // localhost, not 0.0.0.0: Firefox refuses to connect to 0.0.0.0
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8001",
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
    headless: true,
  },
  
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'checkout',
      testMatch: "*.spec.ts",
      use: { ...devices['Desktop Chrome']},
    },
    // The dropdown position bug (#17035) only appeared in Firefox and WebKit.
    {
      name: 'firefox',
      testMatch: "**/navigation/dropdown-scroll.spec.ts",
      use: { ...devices['Desktop Firefox']},
    },
    {
      name: 'webkit',
      testMatch: "**/navigation/dropdown-scroll.spec.ts",
      use: { ...devices['Desktop Safari']},
    },
  ],
});
