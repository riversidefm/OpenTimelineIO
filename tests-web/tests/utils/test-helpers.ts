/**
 * Test utilities for OpenTimelineIO Playwright tests
 */

import { Page, TestInfo } from '@playwright/test';

interface OTIOModules {
  openTimeModule: any;
  otioModule: any;
}

interface WindowWithOTIO extends Window {
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

interface ErrorTrack {
  message: string;
  stack?: string;
  timestamp: string;
}

/**
 * Load OpenTimelineIO modules in the correct order
 */
async function loadOTIOModules(page: Page, retries: number = 2): Promise<OTIOModules> {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      // Check if page is already closed before starting
      if (page.isClosed()) {
        throw new Error(`Page was already closed at start of attempt ${attempt}`);
      }
      // Set up page close detection
      let pageClosedDuringLoad = false;
      const closeHandler = () => {
        pageClosedDuringLoad = true;
        console.error(`🚨 Page closed during WASM loading (attempt ${attempt})`);
      };
      page.once('close', closeHandler);
      try {
        // Navigate to localhost first to establish proper context
        await page.goto('http://localhost:8000', {
          waitUntil: 'networkidle',
          timeout: 120000  // Increased timeout
        });
        
        if (pageClosedDuringLoad) {
          throw new Error('Page closed during navigation');
        }
        // Load OpenTime module
        await page.addScriptTag({ 
          url: '/build-wasm/src/ts-opentimelineio/opentime-bindings/opentime.js'
        });
        
        if (pageClosedDuringLoad) {
          throw new Error('Page closed during OpenTime script loading');
        }
        // Wait for the module to be available
        await page.waitForFunction(
          () => typeof (window as any).OpenTimeModule === 'function',
          { timeout: 120000 }
        );
        
        if (pageClosedDuringLoad) {
          throw new Error('Page closed while waiting for OpenTimeModule');
        }
        // Initialize with error handling
        const openTimeModule = await page.evaluate(async () => {
          try {
            const win = window as unknown as WindowWithOTIO;
            const opentimeM = await win.OpenTimeModule();
            win.Module = {
              ...win.Module,
              ...opentimeM,
            };
            return opentimeM;
          } catch (error: any) {
            throw new Error(`OpenTimeModule initialization failed: ${error.message}`);
          }
        });
        
        if (pageClosedDuringLoad) {
          throw new Error('Page closed during OpenTimeModule initialization');
        }
        // Load OpenTimelineIO module
        await page.addScriptTag({
          url: '/build-wasm/src/ts-opentimelineio/opentimelineio-bindings/opentimelineio.js'
        });
        
        if (pageClosedDuringLoad) {
          throw new Error('Page closed during OpenTimelineIO script loading');
        }
        // Wait for the module to be available
        await page.waitForFunction(
          () => typeof (window as any).OpenTimelineIOModule === 'function',
          { timeout: 120000 }
        );
        
        if (pageClosedDuringLoad) {
          throw new Error('Page closed while waiting for OpenTimelineIOModule');
        }
        // Initialize with error handling
        const otioModule = await page.evaluate(async () => {
          try {
            const win = window as unknown as WindowWithOTIO;
            const otioM = await win.OpenTimelineIOModule();
            win.Module = {
              ...win.Module,
              ...otioM,
            };
            return otioM;
          } catch (error: any) {
            throw new Error(`OpenTimelineIOModule initialization failed: ${error.message}`);
          }
        });
        
        if (pageClosedDuringLoad) {
          throw new Error('Page closed during OpenTimelineIOModule initialization');
        }

        // Load wrappers with cache busting
        await page.addScriptTag({
          url: `/src/ts-opentimelineio/typescript/wrappers.js?v=${Date.now()}`
        });
        
        if (pageClosedDuringLoad) {
          throw new Error('Page closed during wrappers loading');
        }

        // Wait for wrappers to be available
        await page.waitForFunction(
          () => {
            const win = window as any;
            return win.OTIO && win.OTIO.Timeline && win.OTIO.Track && win.OTIO.Clip;
          },
          { timeout: 120000 }
        );
        
        if (pageClosedDuringLoad) {
          throw new Error('Page closed while waiting for OTIO wrappers');
        }

        return { openTimeModule, otioModule };
        
      } finally {
        // Clean up the close handler
        page.off('close', closeHandler);
      }
      
    } catch (error: any) {
      console.warn(`Module loading attempt ${attempt} failed:`, error.message);
      
      if (attempt <= retries) {
        console.log(`Retrying module loading (${attempt}/${retries})...`);
        // Wait before retry with exponential backoff
        await page.waitForTimeout(1000 * attempt);
        continue;
      }
      
      // Final attempt failed - fall through to original error handling
    }
  }
  
  // This should never be reached, but keeping original error handling as fallback
  try {
    throw new Error('All retry attempts failed');
  } catch (error: any) {
    // Enhanced error reporting - but only if page is still available
    let pageErrors = ['Page unavailable for error reporting'];
    
    try {
      // Check if page is still available before trying to evaluate
      if (page && !page.isClosed()) {
        pageErrors = await page.evaluate(() => {
          const errors: string[] = [];
          const win = window as any;
          // Check what's available in window
          errors.push(`OpenTimeModule available: ${typeof win.OpenTimeModule}`);
          errors.push(`OpenTimelineIOModule available: ${typeof win.OpenTimelineIOModule}`);
          errors.push(`OTIO available: ${typeof win.OTIO}`);
          return errors;
        });
      }
    } catch (evalError: any) {
      pageErrors = [`Failed to get page state: ${evalError.message}`];
    }
    
    console.error('Module loading failed after all retries:', error.message);
    console.error('Page state:', pageErrors);
    throw new Error(`Failed to load OTIO modules after ${retries + 1} attempts: ${error.message}. Page state: ${pageErrors.join(', ')}`);
  }
}

/**
 * Set up error tracking for a test page
 */
function setupErrorTracking(page: Page, testInfo: TestInfo): void {
  const errors: ErrorTrack[] = [];
  const warnings: ErrorTrack[] = [];
  
  page.on('pageerror', error => {
    errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({
        message: msg.text(),
        timestamp: new Date().toISOString()
      });
    } else if (msg.type() === 'warning') {
      warnings.push({
        message: msg.text(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Attach errors to test info when test completes
  testInfo.attach('page-errors', {
    body: JSON.stringify(errors, null, 2),
    contentType: 'application/json'
  });
  
  testInfo.attach('page-warnings', {
    body: JSON.stringify(warnings, null, 2),
    contentType: 'application/json'
  });
}

/**
 * Wait for modules to be ready and functional
 */
async function waitForModulesReady(page: Page, timeout: number = 60000): Promise<void> {
  await page.waitForFunction(
    () => {
      const win = window as any;
      return win.Module && 
             win.OTIO && 
             win.OTIO.Timeline && 
             win.OTIO.Track && 
             win.OTIO.Clip &&
             typeof win.OTIO.Timeline === 'function' &&
             typeof win.OTIO.Track === 'function' &&
             typeof win.OTIO.Clip === 'function';
    },
    { timeout }
  );
}

/**
 * Create a basic timeline for testing
 */
async function createBasicTimeline(page: Page, timelineName: string = "Test Timeline"): Promise<any> {
  return await page.evaluate((name) => {
    const win = window as any;
    const timeline = new win.OTIO.Timeline(name);
    const videoTrack = new win.OTIO.Track("V1", "Video");
    const audioTrack = new win.OTIO.Track("A1", "Audio");
    
    timeline.add_track(videoTrack);
    timeline.add_track(audioTrack);
    
    return {
      timeline,
      videoTrack,
      audioTrack,
      trackCount: timeline.track_count()
    };
  }, timelineName);
}

/**
 * Create a clip with time range
 */
async function createClipWithRange(page: Page, name: string, startFrame: number = 0, durationFrames: number = 24, rate: number = 24): Promise<any> {
  return await page.evaluate((params: { name: string; start: number; duration: number; rate: number }) => {
    const win = window as any;
    const clip = new win.OTIO.Clip(params.name);
    const range = new win.Module.TimeRange(
      new win.Module.RationalTime(params.start, params.rate),
      new win.Module.RationalTime(params.duration, params.rate)
    );
    clip.set_source_range(range);
    return clip;
  }, { name, start: startFrame, duration: durationFrames, rate });
}

/**
 * Verify that all modules are working correctly
 */
async function verifyModulesWorking(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    try {
      const win = window as any;
      
      // Test basic object creation
      const timeline = new win.OTIO.Timeline("Verify Test");
      const track = new win.OTIO.Track("Test Track", "Video");
      const clip = new win.OTIO.Clip("Test Clip");
      
      // Test basic operations
      timeline.add_track(track);
      track.add_clip(clip);
      
      const success = timeline.track_count() === 1 && track.clip_count() === 1;
      
      // Cleanup
      clip.dispose();
      track.dispose();
      timeline.dispose();
      
      return success;
    } catch (error) {
      console.error('Module verification failed:', error);
      return false;
    }
  });
}

export {
  loadOTIOModules,
  setupErrorTracking,
  waitForModulesReady,
  createBasicTimeline,
  createClipWithRange,
  verifyModulesWorking
}; 