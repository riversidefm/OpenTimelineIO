import { chromium, Browser, Page } from '@playwright/test';
import { loadOpenTimelineModule } from './helpers/module-loader';

interface ModuleTestResult {
  error?: string;
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

    // Use the helper function to load the module
    await loadOpenTimelineModule(page);

    // Test we can create the base of bases, SerializableObject
    const testResult: ModuleTestResult = await page.evaluate(async () => {
      try {
        const win = window as any;
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