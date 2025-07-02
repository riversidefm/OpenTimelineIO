import { test, expect, Page } from '@playwright/test';

test.describe('Timeline Test', () => {
  
  test.beforeEach(async ({ page }: { page: Page }) => {
    // Use the exact working pattern from global setup
    await page.goto('http://localhost:8000/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.addScriptTag({ 
      url: '/build-wasm/src/ts-opentimelineio/opentime-bindings/opentime.js'
    });
    
    await page.waitForFunction(
      () => typeof (window as any).OpenTimeModule === 'function',
      { timeout: 30000 }
    );
    
    await page.addScriptTag({ 
      url: '/build-wasm/src/ts-opentimelineio/opentimelineio-bindings/opentimelineio.js'
    });
    
    await page.waitForFunction(
      () => typeof (window as any).OpenTimelineIOModule === 'function',
      { timeout: 30000 }
    );
    
    await page.addScriptTag({ 
      url: '/src/ts-opentimelineio/typescript/wrappers.js'
    });
    
    await page.waitForFunction(
      () => {
        const win = window as any;
        return win.OTIO && win.OTIO.Timeline && win.OTIO.Track && win.OTIO.Clip;
      },
      { timeout: 30000 }
    );
    
    // Initialize modules with CORRECT order (exactly like global setup)
    await page.evaluate(async () => {
      const win = window as any;
      const openTimeModule = await win.OpenTimeModule();
      const otioModule = await win.OpenTimelineIOModule();
      win.Module = {
        ...otioModule,        // OTIO first
        ...openTimeModule,    // OpenTime second
      };
    });
  });

  test('should create timeline with correct name', async ({ page }: { page: Page }) => {
    const result = await page.evaluate(() => {
      try {
        // Simple test - just create timeline and get name
        const timeline = new (window as any).OTIO.Timeline("Isolated Test Movie");
        const name = timeline.name();
        
        // Cleanup
        timeline.dispose();
        
        return { timelineName: name };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Timeline test failed: ${errorMessage}`);
      }
    });
    
    expect(result.timelineName).toBe("Isolated Test Movie");
  });

  test('should create complex timeline compositions', async ({ page }: { page: Page }) => {
    const result = await page.evaluate(() => {
      try {
        // Test 1: Basic timeline and track creation (we know this works)
        const timeline = new (window as any).OTIO.Timeline("E2E Test Movie");
        const videoTrack = new (window as any).OTIO.Track("V1", "Video");
        
        timeline.add_track(videoTrack);
        
        // Test 2: Try creating RationalTime and TimeRange objects
        console.log("Creating RationalTime objects...");
        const startTime = new (window as any).Module.RationalTime(0, 24);
        const duration = new (window as any).Module.RationalTime(24, 24);
        console.log("RationalTime objects created successfully");
        
        console.log("Creating TimeRange object...");
        const range = new (window as any).Module.TimeRange(startTime, duration);
        console.log("TimeRange object created successfully");
        
        // Test 3: Create clip and set source range
        console.log("Creating clip...");
        const clip = new (window as any).OTIO.Clip("Shot_1");
        console.log("Setting source range on clip...");
        clip.set_source_range(range);
        console.log("Source range set successfully");
        
        videoTrack.add_clip(clip);
        
        // Test 4: Get basic info to verify everything worked
        const timelineName = timeline.name();
        const trackCount = timeline.track_count();
        const clipCount = videoTrack.clip_count();
        
        // Cleanup
        clip.dispose();
        videoTrack.dispose();
        timeline.dispose();
        
        return {
          timelineName,
          trackCount,
          clipCount
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Timeline composition failed: ${errorMessage}`);
      }
    });
    
    expect(result.timelineName).toBe("E2E Test Movie");
    expect(result.trackCount).toBe(1);
    expect(result.clipCount).toBe(1);
  });
}); 