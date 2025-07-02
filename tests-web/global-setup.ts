import { chromium, Browser, Page } from '@playwright/test';

interface ModuleTestResult {
  timelineName: string;
  trackName: string;
  clipName: string;
  error?: string;
}

interface WindowWithModules extends Window {
  OpenTimeModule: () => Promise<any>;
  OpenTimelineIOModule: () => Promise<any>;
  Module: any;
  OTIO: {
    Timeline: new (name: string, tracks?: any, metadata?: any) => any;
    Track: new (name: string, kind?: string, children?: any) => any;
    Clip: new (name: string, media_reference?: any, source_range?: any, metadata?: any) => any;
    Effect: new (name: string, effect_name?: string, metadata?: any) => any;
    Stack: new (name: string, children?: any, source_range?: any, metadata?: any) => any;
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
      '/build-wasm/src/ts-opentimelineio/opentime-bindings/opentime.js',
      '/build-wasm/src/ts-opentimelineio/opentimelineio-bindings/opentimelineio.js',
      '/src/ts-opentimelineio/typescript/wrappers.js'
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
    
    await page.addScriptTag({ 
      url: '/build-wasm/src/ts-opentimelineio/opentime-bindings/opentime.js'
    });
    
    // Wait for OpenTimeModule to be available
    await page.waitForFunction(
      () => typeof (window as any).OpenTimeModule === 'function',
      { timeout: 30000 }
    );
    
    await page.addScriptTag({ 
      url: '/build-wasm/src/ts-opentimelineio/opentimelineio-bindings/opentimelineio.js'
    });
    
    // Wait for OpenTimelineIOModule to be available
    await page.waitForFunction(
      () => typeof (window as any).OpenTimelineIOModule === 'function',
      { timeout: 30000 }
    );
    
    await page.addScriptTag({ 
      url: '/src/ts-opentimelineio/typescript/wrappers.js'
    });
    
    // Wait for OTIO wrappers to be available
    await page.waitForFunction(
      () => {
        const win = window as any;
        return win.OTIO && win.OTIO.Timeline && win.OTIO.Track && win.OTIO.Clip;
      },
      { timeout: 30000 }
    );
    
    // Test basic functionality
    const testResult: ModuleTestResult = await page.evaluate(async () => {
      try {
        const win = window as unknown as WindowWithModules;
        const openTimeModule = await win.OpenTimeModule();
        const otioModule = await win.OpenTimelineIOModule();
        win.Module = {
          ...otioModule,
          ...openTimeModule,
        };
        
        // Test basic object creation
        const timeline = new win.OTIO.Timeline("Setup Test");
        const track = new win.OTIO.Track("Test Track", "Video");
        const clip = new win.OTIO.Clip("Test Clip");
        
        const result = {
          timelineName: timeline.name(),
          trackName: track.name(),
          clipName: clip.name()
        };
        
        // Cleanup
        clip.dispose();
        track.dispose();
        timeline.dispose();
        
        return result;
      } catch (error: any) {
        return { error: error.message, timelineName: '', trackName: '', clipName: '' };
      }
    });
    
    if (testResult.error) {
      throw new Error(`Module functionality test failed: ${testResult.error}`);
    }
    
    console.log('✅ Module functionality test passed');
    console.log(`   Timeline: "${testResult.timelineName}"`);
    console.log(`   Track: "${testResult.trackName}"`);
    console.log(`   Clip: "${testResult.clipName}"`);
    
    console.log('🎉 Global setup completed successfully!');
    
  } catch (error: any) {
    console.error('❌ Global setup failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup; 