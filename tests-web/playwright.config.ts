import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Global setup */
  globalSetup: './global-setup.ts',
  /* Run tests in files in parallel - disabled for WASM stability */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Single worker for WASM module stability */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:8000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Take screenshot on test failure */
    screenshot: 'only-on-failure',
    /* Record video on test failure */
    video: 'retain-on-failure',
    /* Increase timeouts for WASM loading */
    actionTimeout: 120000, // 2 minutes
    navigationTimeout: 120000, // 2 minutes
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Enable SharedArrayBuffer for WASM with increased memory limits
        launchOptions: {
          args: [
            '--enable-features=SharedArrayBuffer',
            '--cross-origin-isolation',
            '--allow-file-access-from-files',
            '--max-old-space-size=8192',  // Increase V8 heap size to 8GB
            '--js-flags=--max-old-space-size=8192',
            '--disable-dev-shm-usage',    // Overcome limited resource problems
            '--disable-web-security',     // Disable web security for WASM
            '--disable-backgrounding-occluded-windows', // Prevent tab suspension
            '--disable-background-timer-throttling',    // Disable timer throttling
            '--disable-renderer-backgrounding',         // Keep renderer active
            '--disable-features=TranslateUI',           // Reduce overhead
            '--disable-extensions',                     // Reduce overhead
            '--no-sandbox',                             // Remove sandbox restrictions
            '--aggressive-cache-discard=false'          // Don't discard caches aggressively
          ]
        }
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        launchOptions: {
          firefoxUserPrefs: {
            'javascript.options.shared_memory': true,
            'dom.postMessage.sharedArrayBuffer.withCOOP_COEP': true,
            'browser.tabs.remote.autostart': true,
            'browser.tabs.remote.force-enable': true,
            'dom.workers.maxPerDomain': 20,  // Allow more workers
            'javascript.options.mem.max': 2147483648,  // 2GB memory limit
            'browser.tabs.unloadOnLowMemory': false,   // Don't unload tabs on low memory
          }
        }
      },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'python3 -m http.server 8000',
    port: 8000,
    cwd: '..',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
    stdout: 'pipe',
    stderr: 'pipe',
  },
}); 