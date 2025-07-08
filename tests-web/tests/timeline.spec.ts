import { test, expect, Page } from '@playwright/test';

// Proper type definitions based on the existing codebase
interface RationalTime {
  value(): number;
  rate(): number;
  is_invalid_time(): boolean;
  rescaled_to(rate: number): RationalTime;
  rescaled_to(other: RationalTime): RationalTime;
  value_rescaled_to(rate: number): number;
  value_rescaled_to(other: RationalTime): number;
  almost_equal(other: RationalTime, delta?: number): boolean;
}

interface TimeRange {
  start_time: RationalTime;
  duration: RationalTime;
  end_time_inclusive(): RationalTime;
  end_time_exclusive(): RationalTime;
  duration_extended_by(other: RationalTime): RationalTime;
  extended_by(other: RationalTime): TimeRange;
  clamped(time: RationalTime): TimeRange;
  clamped(range: TimeRange): TimeRange;
  contains(time: RationalTime): boolean;
  contains(range: TimeRange): boolean;
  overlaps(range: TimeRange): boolean;
  intersects(range: TimeRange): boolean;
}

interface OTIORationalTime {
  value(): number;
  rate(): number;
  to_seconds(): number;
  rescaled_to(rate: number): OTIORationalTime;
  almost_equal(other: OTIORationalTime, delta?: number): boolean;
}

interface Timeline {
  name(): string;
  set_name(name: string): void;
  to_json_string(): string;
  schema_name(): string;
  schema_version(): number;
  duration(): OTIORationalTime;
  add_track(track: Track): boolean;
  insert_track(index: number, track: Track): boolean;
  remove_track(index: number): boolean;
  get_track(index: number): Track | null;
  track_count(): number;
  dispose(): void;
}

interface Track {
  name(): string;
  set_name(name: string): void;
  kind(): string;
  set_kind(kind: string): void;
  enabled(): boolean;
  set_enabled(enabled: boolean): void;
  to_json_string(): string;
  readonly length: number;
  child_at(index: number): any | null;
  append(item: any): boolean;
  insert(index: number, item: any): boolean;
  remove(index: number): boolean;
  index_of(item: any): number;
  add_clip(clip: Clip): boolean;
  insert_clip(index: number, clip: Clip): boolean;
  remove_clip(index: number): boolean;
  get_clip(index: number): Clip | null;
  clip_count(): number;
  dispose(): void;
}

interface Clip {
  name(): string;
  set_name(name: string): void;
  source_range(): any;
  set_source_range(range: any): void;
  duration(): OTIORationalTime;
  enabled(): boolean;
  set_enabled(enabled: boolean): void;
  to_json_string(): string;
  media_reference(): any | null;
  set_media_reference(ref: any): void;
  dispose(): void;
}

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
        const win = window as any;
        // Simple test - just create timeline and get name
        const timeline: Timeline = new win.OTIO.Timeline("Isolated Test Movie");
        const name: string = timeline.name();
        
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
        const win = window as any;
        
        // Test 1: Basic timeline and track creation (we know this works)
        const timeline: Timeline = new win.OTIO.Timeline("E2E Test Movie");
        const videoTrack: Track = new win.OTIO.Track("V1", "Video");
        
        timeline.add_track(videoTrack);
        
        // Test 2: Try creating RationalTime and TimeRange objects
        console.log("Creating RationalTime objects...");
        const startTime: RationalTime = new win.Module.RationalTime(0, 24);
        const duration: RationalTime = new win.Module.RationalTime(24, 24);
        console.log("RationalTime objects created successfully");
        
        console.log("Creating TimeRange object...");
        const range: TimeRange = new win.Module.TimeRange(startTime, duration);
        console.log("TimeRange object created successfully");
        
        // Test 3: Create clip and set source range
        console.log("Creating clip...");
        const clip: Clip = new win.OTIO.Clip("Shot_1");
        console.log("Setting source range on clip...");
        clip.set_source_range(range);
        console.log("Source range set successfully");
        
        videoTrack.add_clip(clip);
        
        // Test 4: Get basic info to verify everything worked
        const timelineName: string = timeline.name();
        const trackCount: number = timeline.track_count();
        const clipCount: number = videoTrack.clip_count();
        
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