import { chromium, Browser, Page } from '@playwright/test';

interface ModuleTestResult {
  error?: string;
}

interface WindowWithModules extends Window {
  OpenTimelineIO: {
    SerializableObject: new () => any;
  };
}

async function globalSetup(): Promise<void> {
  console.log('🚀 Setting up OpenTimelineIO tests...');

  // Start a browser to test module loading
  const browser: Browser = await chromium.launch();
  const page: Page = await browser.newPage();

  try {
    // Test that we can access the test page
    console.log('📡 Testing web server connectivity...');
    await page.goto('http://localhost:8000/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Test that WASM modules are accessible
    console.log('🧪 Testing WASM module accessibility...');
    const moduleTests: string[] = [
      '/build/src/ts-opentimelineio/opentimeline.js',
    ];

    for (const moduleUrl of moduleTests) {
      const response = await page.goto(`http://localhost:8000${moduleUrl}`, {
        timeout: 10000
      });

      if (!response || !response.ok()) {
        throw new Error(`Failed to load ${moduleUrl}: ${response?.status()}`);
      }

      console.log(`✅ ${moduleUrl} - OK`);
    }

            // Test basic module loading
    console.log('🔧 Testing module initialization...');

    // Navigate to a blank page first
    await page.goto('http://localhost:8000/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Load the module script as ES6 module
    await page.addScriptTag({
      url: '/build/src/ts-opentimelineio/opentimeline.js',
      type: 'module'
    });

    // Initialize the module
    await page.evaluate(async () => {
      try {
        // Debug: Check what's available on window
        console.log('Window keys after loading:', Object.keys(window).filter(k => k.includes('Time')));

        // Try to import the module dynamically
        const modulePath = '/build/src/ts-opentimelineio/opentimeline.js';
        const OpenTimelineModule = await import(modulePath);

        console.log('Module imported:', OpenTimelineModule);
        console.log('Module keys:', Object.keys(OpenTimelineModule));

        // Get the factory function (default export)
        const factoryFunction = OpenTimelineModule.default;

        if (typeof factoryFunction !== 'function') {
          throw new Error('Factory function not found in module exports');
        }

        // Initialize the module
        const Module = await factoryFunction();

        // Make it available globally
        (window as any).OpenTimeline = Module;

        console.log('Module loaded successfully in global-setup');
      } catch (error) {
        console.error('Failed to load module in global-setup:', error);
        throw error;
      }
    });

    // Wait for the module to be fully loaded and available
    await page.waitForFunction(
      () => {
        const win = window as any;
        return win.OpenTimeline &&
               typeof win.OpenTimeline.SerializableObject === 'function';
      },
      { timeout: 30000 }
    );

    // Test we can create the base of bases, SerializableObject
    const testResult: ModuleTestResult = await page.evaluate(async () => {
      try {
        const win = window as unknown as WindowWithModules;
        const OTIO = win.OpenTimeline;
        const obj = new OTIO.SerializableObject();
        return { success: true };
      } catch (error: any) {
        return { error: error.message };
      }
    });

    if (testResult.error) {
      throw new Error(`Module functionality test failed: ${testResult.error}`);
    }

    console.log('✅ Module SerializableObject test passed');

    console.log('🎉 Global setup completed successfully!');

  } catch (error: any) {
    console.error('❌ Global setup failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;