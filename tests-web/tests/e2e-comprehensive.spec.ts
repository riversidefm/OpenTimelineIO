import { test, expect, Page, TestInfo } from '@playwright/test';
import { 
  loadOTIOModules, 
  setupErrorTracking, 
  waitForModulesReady,
  verifyModulesWorking
} from './utils/test-helpers';

// Type definitions based on OpenTimelineIO TypeScript bindings
interface OTIORationalTime {
  value(): number;
  rate(): number;
  to_seconds(): number;
  rescaled_to(rate: number): OTIORationalTime;
  almost_equal(other: OTIORationalTime, delta?: number): boolean;
  add(other: OTIORationalTime): OTIORationalTime;
  subtract(other: OTIORationalTime): OTIORationalTime;
}

interface OTIOTimeRange {
  start_time(): OTIORationalTime;
  duration(): OTIORationalTime;
  end_time_inclusive(): OTIORationalTime;
  end_time_exclusive(): OTIORationalTime;
  extended_by(other: OTIOTimeRange): OTIOTimeRange;
  contains_time(time: OTIORationalTime): boolean;
}

interface OpenTimeRationalTime {
  value(): number;
  rate(): number;
  rescaled_to(rate: number): OpenTimeRationalTime;
  rescaled_to(other: OpenTimeRationalTime): OpenTimeRationalTime;
}

interface OpenTimeRange {
  start_time: OpenTimeRationalTime;
  duration: OpenTimeRationalTime;
  end_time_inclusive(): OpenTimeRationalTime;
  extended_by(other: OpenTimeRange): OpenTimeRange;
}

interface OTIOTimeline {
  name(): string;
  set_name(name: string): void;
  track_count(): number;
  add_track(track: OTIOTrack): boolean;
  get_track(index: number): OTIOTrack | null;
  to_json_string(): string;
  dispose(): void;
}

interface OTIOTrack {
  name(): string;
  set_name(name: string): void;
  kind(): string;
  clip_count(): number;
  add_clip(clip: OTIOClip): boolean;
  get_clip(index: number): OTIOClip | null;
  dispose(): void;
}

interface OTIOClip {
  name(): string;
  set_name(name: string): void;
  source_range(): OTIOTimeRange | null;
  set_source_range(range: OTIOTimeRange | OpenTimeRange | null): void;
  duration(): OTIORationalTime;
  enabled(): boolean;
  set_enabled(enabled: boolean): void;
  add_effect(effect: OTIOEffect): boolean;
  effect_count(): number;
  get_effect(index: number): OTIOEffect | null;
  remove_effect(index: number): boolean;
  to_json_string(): string;
  dispose(): void;
}

interface OTIOEffect {
  name(): string;
  set_name(name: string): void;
  effect_name(): string;
  set_effect_name(name: string): void;
  to_json_string(): string;
  dispose(): void;
}

interface OTIOStack {
  name(): string;
  set_name(name: string): void;
  dispose(): void;
}

// Extend window interface for OTIO modules
declare global {
  interface Window {
    Module: {
      TimeRange: new (start: OpenTimeRationalTime, duration: OpenTimeRationalTime) => OpenTimeRange;
      RationalTime: new (value: number, rate: number) => OpenTimeRationalTime;
      OTIOTimeRange: new (start: OTIORationalTime, duration: OTIORationalTime) => OTIOTimeRange;
      OTIORationalTime: new (value: number, rate: number) => OTIORationalTime;
      get_version(): string;
      test_connection(): boolean;
      create_timeline(name: string): number;
      create_track(name: string, kind: string): number;
      create_clip(name: string): number;
      create_effect(name: string, effect_name: string): number;
      timeline_name(handle: number): string;
      effect_effect_name(handle: number): string;
      delete_timeline(handle: number): void;
      delete_track(handle: number): void;
      delete_clip(handle: number): void;
      delete_effect(handle: number): void;
    };
    OTIO: {
      Timeline: new (name: string, tracks?: OTIOTrack[], metadata?: Record<string, unknown>) => OTIOTimeline;
      Track: new (name: string, kind?: string, children?: OTIOClip[]) => OTIOTrack;
      Clip: new (name: string, media_reference?: unknown, source_range?: OTIOTimeRange, metadata?: Record<string, unknown>) => OTIOClip;
      Effect: new (name: string, effect_name?: string, metadata?: Record<string, unknown>) => OTIOEffect;
      Stack: new (name: string, children?: unknown[], source_range?: OTIOTimeRange, metadata?: Record<string, unknown>) => OTIOStack;
    };
  }
}

test.describe('OpenTimelineIO E2E Comprehensive Tests', () => {
  
  test.beforeEach(async ({ page }: { page: Page }, testInfo: TestInfo) => {
    // Don't navigate to about:blank since loadOTIOModules will navigate to localhost
    setupErrorTracking(page, testInfo);
  });

  test.describe('Module Loading & Initialization', () => {
    
    test('should load all WASM modules successfully', async ({ page }: { page: Page }) => {
      const { openTimeModule, otioModule } = await loadOTIOModules(page);
      
      // Verify modules are loaded
      expect(openTimeModule).toBeDefined();
      expect(otioModule).toBeDefined();
      
      // Wait for full initialization
      await waitForModulesReady(page);
      
      // Verify all required classes are available
      const classCheck = await page.evaluate(() => {
        const requiredClasses = ['Timeline', 'Track', 'Clip', 'Effect', 'Stack'];
        const results: Record<string, boolean> = {};
        
        for (const className of requiredClasses) {
          results[className] = window.OTIO && typeof (window.OTIO as any)[className] === 'function';
        }
        
        return results;
      });
      
      for (const [_className, available] of Object.entries(classCheck)) {
        expect(available).toBe(true);
      }
    });

    test('should verify module functionality after loading', async ({ page }: { page: Page }) => {
      await loadOTIOModules(page);
      await waitForModulesReady(page);
      
      const verification = await verifyModulesWorking(page);
      
      expect(verification).toBe(true);
    });
  });

  test.describe('Basic Functionality', () => {
    
    test.beforeEach(async ({ page }: { page: Page }) => {
      await loadOTIOModules(page);
      await waitForModulesReady(page);
    });

    test('should test core module functions', async ({ page }: { page: Page }) => {
      const result = await page.evaluate(() => {
        try {
          // Test version and connection
          const version = window.Module.get_version();
          const connected = window.Module.test_connection();
          
          // Test factory functions
          const timelineHandle = window.Module.create_timeline("Test Timeline");
          const trackHandle = window.Module.create_track("Test Track", "Video");
          const clipHandle = window.Module.create_clip("Test Clip");
          const effectHandle = window.Module.create_effect("Test Effect", "Blur");
          
          // Test utility functions
          const timelineName = window.Module.timeline_name(timelineHandle);
          const effectName = window.Module.effect_effect_name(effectHandle);
          
          // Cleanup
          window.Module.delete_timeline(timelineHandle);
          window.Module.delete_track(trackHandle);
          window.Module.delete_clip(clipHandle);
          window.Module.delete_effect(effectHandle);
          
          return {
            version,
            connected,
            timelineHandle: timelineHandle > 0,
            trackHandle: trackHandle > 0,
            clipHandle: clipHandle > 0,
            effectHandle: effectHandle > 0,
            timelineName,
            effectName
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new Error(`Basic functionality test failed: ${errorMessage}`);
        }
      });
      
      expect(result.version).toBeDefined();
      expect(result.connected).toBe(true);
      expect(result.timelineHandle).toBe(true);
      expect(result.trackHandle).toBe(true);
      expect(result.clipHandle).toBe(true);
      expect(result.effectHandle).toBe(true);
      expect(result.timelineName).toBe("Test Timeline");
      expect(result.effectName).toBe("Blur");
    });
  });

  test.describe('Effect System', () => {
    
    test.beforeEach(async ({ page }: { page: Page }) => {
      await loadOTIOModules(page);
      await waitForModulesReady(page);
    });

    test('should create and manage effects', async ({ page }: { page: Page }) => {
      const result = await page.evaluate(() => {
        try {
          // Create timeline with track and clip
          const timeline = new window.OTIO.Timeline("Effect Test");
          const track = new window.OTIO.Track("V1", "Video");
          const clip = new window.OTIO.Clip("Test Clip");
          
          timeline.add_track(track);
          track.add_clip(clip);
          
          // Create effects
          const blurEffect = new window.OTIO.Effect("Blur Effect", "Blur");
          const colorEffect = new window.OTIO.Effect("Color Correction", "ColorCorrect");
          
          // Add effects to clip
          const addBlur = clip.add_effect(blurEffect);
          const addColor = clip.add_effect(colorEffect);
          
          const effectCount = clip.effect_count();
          
          // Get effect info
          const effects = [];
          for (let i = 0; i < clip.effect_count(); i++) {
            const effect = clip.get_effect(i);
            if (effect) {
              effects.push({
                name: effect.name(),
                effectName: effect.effect_name()
              });
            }
          }
          
          // Remove an effect
          const removeResult = clip.remove_effect(0);
          const finalEffectCount = clip.effect_count();
          
          // Cleanup
          blurEffect.dispose();
          colorEffect.dispose();
          clip.dispose();
          track.dispose();
          timeline.dispose();
          
          return {
            addBlur,
            addColor,
            effectCount,
            effects,
            removeResult,
            finalEffectCount
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new Error(`Effect system test failed: ${errorMessage}`);
        }
      });
      
      expect(result.addBlur).toBe(true);
      expect(result.addColor).toBe(true);
      expect(result.effectCount).toBe(2);
      expect(result.effects).toHaveLength(2);
      expect(result.effects[0].effectName).toBe("Blur");
      expect(result.effects[1].effectName).toBe("ColorCorrect");
      expect(result.removeResult).toBe(true);
      expect(result.finalEffectCount).toBe(1);
    });
  });

  test.describe('Time Operations', () => {
    
    test.beforeEach(async ({ page }: { page: Page }) => {
      await loadOTIOModules(page);
      await waitForModulesReady(page);
    });

    test('should perform time calculations and conversions', async ({ page }: { page: Page }) => {
      const result = await page.evaluate(() => {
        try {
          // Create rational times
          const time1 = new window.Module.OTIORationalTime(100, 24);
          const time2 = new window.Module.OTIORationalTime(50, 24);
          
          // Test basic operations
          const sum = time1.add(time2);
          const difference = time1.subtract(time2);
          const scaled = time1.rescaled_to(30);

          // Create time ranges using constructor
          const range1 = new window.Module.OTIOTimeRange(time1, time2);
          const duration = range1.duration();
          const startTime = range1.start_time();

          const range2 = new window.Module.OTIOTimeRange(time1, time2);

          // Test time range operations
          const extendedRange = range1.extended_by(range2);
          const endTime = range1.end_time_inclusive();
          
          return {
            time1Value: time1.value(),
            time1Rate: time1.rate(),
            sumValue: sum.value(),
            differenceValue: difference.value(),
            scaledValue: scaled.value(),
            scaledRate: scaled.rate(),
            durationValue: duration.value(),
            startTimeValue: startTime.value(),
            endTimeValue: endTime.value(),
            extendedDuration: extendedRange.duration().value()
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new Error(`Time operations failed: ${errorMessage}`);
        }
      });
      
      expect(result.time1Value).toBe(100);
      expect(result.time1Rate).toBe(24);
      expect(result.sumValue).toBe(150);
      expect(result.differenceValue).toBe(50);
      expect(result.scaledValue).toBe(125); // 100 * 30/24
      expect(result.scaledRate).toBe(30);
      expect(result.durationValue).toBe(50);
      expect(result.extendedDuration).toBe(50); // original 50 + extended 50
    });
  });

  test.describe('Serialization & JSON', () => {
    
    test.beforeEach(async ({ page }: { page: Page }) => {
      await loadOTIOModules(page);
      await waitForModulesReady(page);
    });

    test('should serialize and deserialize timeline data', async ({ page }: { page: Page }) => {
      const result = await page.evaluate(() => {
        try {
          // Create complex timeline
          const timeline = new window.OTIO.Timeline("Serialization Test");
          const videoTrack = new window.OTIO.Track("V1", "Video");
          const audioTrack = new window.OTIO.Track("A1", "Audio");
          
          timeline.add_track(videoTrack);
          timeline.add_track(audioTrack);
          
          // Add clips with metadata
          const clip = new window.OTIO.Clip("Test Clip");
          const range = new window.Module.TimeRange(
            new window.Module.RationalTime(0, 24),
            new window.Module.RationalTime(120, 24)
          );
          clip.set_source_range(range);
          videoTrack.add_clip(clip);
          
          // Add effect
          const effect = new window.OTIO.Effect("Test Effect", "Blur");
          clip.add_effect(effect);
          
          // Serialize to JSON
          const jsonString = timeline.to_json_string();
          const jsonLength = jsonString.length;
          
          // Parse and validate structure
          const parsed = JSON.parse(jsonString);
          const schema = parsed.OTIO_SCHEMA;
          const name = parsed.name;
          const tracksCount = parsed.tracks?.children?.length || 0;
          
          // Cleanup
          effect.dispose();
          clip.dispose();
          videoTrack.dispose();
          audioTrack.dispose();
          timeline.dispose();
          
          return {
            jsonLength,
            schema,
            name,
            tracksCount,
            hasValidJSON: !!parsed
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new Error(`Serialization test failed: ${errorMessage}`);
        }
      });
      
      expect(result.jsonLength).toBeGreaterThan(100);
      expect(result.schema).toBeDefined();
      expect(result.name).toBe("Serialization Test");
      expect(result.tracksCount).toBe(2);
      expect(result.hasValidJSON).toBe(true);
    });
  });

  test.describe('Memory Management', () => {
    
    test.beforeEach(async ({ page }: { page: Page }) => {
      await loadOTIOModules(page);
      await waitForModulesReady(page);
    });

    test('should properly manage memory with dispose operations', async ({ page }: { page: Page }) => {
      const result = await page.evaluate(() => {
        try {
          const objects = [];
          
          // Create many objects
          for (let i = 0; i < 10; i++) {
            const timeline = new window.OTIO.Timeline(`Timeline_${i}`);
            const track = new window.OTIO.Track(`Track_${i}`, "Video");
            const clip = new window.OTIO.Clip(`Clip_${i}`);
            const effect = new window.OTIO.Effect(`Effect_${i}`, "Blur");
            
            timeline.add_track(track);
            track.add_clip(clip);
            clip.add_effect(effect);
            
            objects.push({ timeline, track, clip, effect });
          }
          
          // Verify all objects are functional
          const allFunctional = objects.every(obj => 
            obj.timeline.name().startsWith('Timeline_') &&
            obj.track.name().startsWith('Track_') &&
            obj.clip.name().startsWith('Clip_') &&
            obj.effect.name().startsWith('Effect_')
          );
          
          // Dispose all objects
          objects.forEach(obj => {
            obj.effect.dispose();
            obj.clip.dispose();
            obj.track.dispose();
            obj.timeline.dispose();
          });
          
          return {
            objectCount: objects.length,
            allFunctional,
            disposedSuccessfully: true
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new Error(`Memory management test failed: ${errorMessage}`);
        }
      });
      
      expect(result.objectCount).toBe(10);
      expect(result.allFunctional).toBe(true);
      expect(result.disposedSuccessfully).toBe(true);
    });
  });

  test.describe('Stress Testing', () => {
    
    test.beforeEach(async ({ page }: { page: Page }) => {
      await loadOTIOModules(page);
      await waitForModulesReady(page);
    });

    test('should handle large timeline with many tracks and clips', async ({ page }: { page: Page }) => {
      const result = await page.evaluate(() => {
        try {
          const startTime = performance.now();
          
          // Create large timeline
          const timeline = new window.OTIO.Timeline("Stress Test Timeline");
          
          // Add many tracks
          const tracks = [];
          for (let t = 0; t < 5; t++) {
            const track = new window.OTIO.Track(`Track_${t}`, t % 2 === 0 ? "Video" : "Audio");
            timeline.add_track(track);
            tracks.push(track);
            
            // Add many clips to each track
            for (let c = 0; c < 20; c++) {
              const clip = new window.OTIO.Clip(`Clip_${t}_${c}`);
              const range = new window.Module.TimeRange(
                new window.Module.RationalTime(c * 24, 24),
                new window.Module.RationalTime(24, 24)
              );
              clip.set_source_range(range);
              track.add_clip(clip);
            }
          }
          
          // Perform operations
          const totalTracks = timeline.track_count();
          const totalClips = tracks.reduce((sum, track) => sum + track.clip_count(), 0);
          
          // Serialize large timeline
          const jsonString = timeline.to_json_string();
          const jsonSize = jsonString.length;
          
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          // Cleanup
          tracks.forEach(track => {
            for (let i = 0; i < track.clip_count(); i++) {
              const clip = track.get_clip(i);
              if (clip) clip.dispose();
            }
            track.dispose();
          });
          timeline.dispose();
          
          return {
            totalTracks,
            totalClips,
            jsonSize,
            processingTime: duration,
            performanceAcceptable: duration < 5000 // Should complete in under 5 seconds
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new Error(`Stress test failed: ${errorMessage}`);
        }
      });
      
      expect(result.totalTracks).toBe(5);
      expect(result.totalClips).toBe(100); // 5 tracks * 20 clips
      expect(result.jsonSize).toBeGreaterThan(1000);
      expect(result.performanceAcceptable).toBe(true);
      expect(result.processingTime).toBeLessThan(5000);
    });
  });
}); 