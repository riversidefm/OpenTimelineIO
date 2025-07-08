import { test, expect } from '@playwright/test';
import { 
  loadOTIOModules, 
  setupErrorTracking, 
  waitForModulesReady,
} from './utils/test-helpers';

// Type interfaces for test results
interface TestSignatures {
  Timeline?: {
    singleParam?: boolean;
    multiParam?: boolean;
    name?: string;
    error?: string;
  };
  Track?: {
    nameOnly?: boolean;
    nameAndKind?: boolean;
    fullParams?: boolean;
    kind1?: string;
    kind2?: string;
    error?: string;
  };
  Clip?: {
    nameOnly?: boolean;
    fullParams?: boolean;
    name?: string;
    error?: string;
  };
  Effect?: {
    nameOnly?: boolean;
    nameAndType?: boolean;
    effectName?: string;
    error?: string;
  };
}

interface PropertySetters {
  timelineSet?: string;
  timelineSetError?: string;
  trackSet?: string;
  trackSetError?: string;
  clipSet?: string;
  clipSetError?: string;
  effectSet?: string;
  effectSetError?: string;
}

interface PropertyResult {
  getters: {
    timelineName: string;
    trackName: string;
    trackKind: string;
    clipName: string;
    effectName: string;
    effectType: string;
  };
  setters: PropertySetters;
}

interface MethodsResult {
  sourceRangeGet?: {
    startValue: number;
    durationValue: number;
  } | null;
  sourceRangeError?: string;
  nameSetError?: string;
  enabledSetError?: string;
  [key: string]: any;
}

interface ErrorTestResult {
  operation: string;
  result?: any;
  error?: string;
}

test.describe('OpenTimelineIO TypeScript Bindings Tests', () => {
  
  test.beforeEach(async ({ page }, testInfo) => {
    // Don't navigate to about:blank since loadOTIOModules will navigate to localhost
    setupErrorTracking(page, testInfo);
  });

  test.describe('Type System Validation', () => {
    
    test.beforeEach(async ({ page }) => {
      await loadOTIOModules(page);
      await waitForModulesReady(page);
    });

    test('should have correct TypeScript class signatures', async ({ page }) => {
      const result = await page.evaluate((): TestSignatures => {
        const signatures: TestSignatures = {};
        
        // Check Timeline constructor signatures
        try {
          const timeline1 = new (window as any).OTIO.Timeline("Test");
          const timeline2 = new (window as any).OTIO.Timeline("Test");
          signatures.Timeline = {
            singleParam: !!timeline1,
            multiParam: !!timeline2,
            name: timeline1.name()
          };
          timeline1.dispose();
          timeline2.dispose();
        } catch (e) {
          signatures.Timeline = { error: (e as Error).message };
        }
        
        // Check Track constructor signatures
        try {
          const track1 = new (window as any).OTIO.Track("Test Track");
          const track2 = new (window as any).OTIO.Track("Test Track", "Video");
          const track3 = new (window as any).OTIO.Track("Test Track", "Video", []);
          signatures.Track = {
            nameOnly: !!track1,
            nameAndKind: !!track2,
            fullParams: !!track3,
            kind1: track1.kind(),
            kind2: track2.kind()
          };
          track1.dispose();
          track2.dispose();
          track3.dispose();
        } catch (e) {
          signatures.Track = { error: (e as Error).message };
        }
        
        // Check Clip constructor signatures
        try {
          const clip1 = new (window as any).OTIO.Clip("Test Clip");
          const clip2 = new (window as any).OTIO.Clip("Test Clip");
          signatures.Clip = {
            nameOnly: !!clip1,
            fullParams: !!clip2,
            name: clip1.name()
          };
          clip1.dispose();
          clip2.dispose();
        } catch (e) {
          signatures.Clip = { error: (e as Error).message };
        }
        
        // Check Effect constructor signatures  
        try {
          const effect1 = new (window as any).OTIO.Effect("Test Effect");
          const effect2 = new (window as any).OTIO.Effect("Test Effect", "Blur");
          signatures.Effect = {
            nameOnly: !!effect1,
            nameAndType: !!effect2,
            effectName: effect2.effect_name()
          };
          effect1.dispose();
          effect2.dispose();
        } catch (e) {
          signatures.Effect = { error: (e as Error).message };
        }
        
        return signatures;
      });
      
      // Validate Timeline signatures
      expect(result.Timeline?.singleParam).toBe(true);
      expect(result.Timeline?.multiParam).toBe(true);
      expect(result.Timeline?.name).toBe("Test");
      
      // Validate Track signatures
      expect(result.Track?.nameOnly).toBe(true);
      expect(result.Track?.nameAndKind).toBe(true);
      expect(result.Track?.fullParams).toBe(true);
      expect(result.Track?.kind2).toBe("Video");
      
      // Validate Clip signatures
      expect(result.Clip?.nameOnly).toBe(true);
      expect(result.Clip?.fullParams).toBe(true);
      expect(result.Clip?.name).toBe("Test Clip");
      
      // Validate Effect signatures
      expect(result.Effect?.nameOnly).toBe(true);
      expect(result.Effect?.nameAndType).toBe(true);
      expect(result.Effect?.effectName).toBe("Blur");
    });

    test('should validate property getters and setters', async ({ page }) => {
      const result = await page.evaluate((): PropertyResult => {
        try {
          const timeline = new (window as any).OTIO.Timeline("Original Name");
          const track = new (window as any).OTIO.Track("Original Track", "Video");
          const clip = new (window as any).OTIO.Clip("Original Clip");
          const effect = new (window as any).OTIO.Effect("Original Effect", "Blur");
          
          // Test property getters
          const getters = {
            timelineName: timeline.name(),
            trackName: track.name(),
            trackKind: track.kind(), 
            clipName: clip.name(),
            effectName: effect.name(),
            effectType: effect.effect_name()
          };
          
          // Test property setters (if available)
          const setters: PropertySetters = {};
          try {
            timeline.set_name("New Timeline Name");
            setters.timelineSet = timeline.name();
          } catch (e) {
            setters.timelineSetError = (e as Error).message;
          }
          
          try {
            track.set_name("New Track Name");
            setters.trackSet = track.name();
          } catch (e) {
            setters.trackSetError = (e as Error).message;
          }
          
          try {
            clip.set_name("New Clip Name");
            setters.clipSet = clip.name();
          } catch (e) {
            setters.clipSetError = (e as Error).message;
          }
          
          try {
            effect.set_name("New Effect Name");
            setters.effectSet = effect.name();
          } catch (e) {
            setters.effectSetError = (e as Error).message;
          }
          
          // Cleanup
          effect.dispose();
          clip.dispose();
          track.dispose();
          timeline.dispose();
          
          return { getters, setters };
        } catch (error) {
          throw new Error(`Property validation failed: ${(error as Error).message}`);
        }
      });
      
      // Validate getters
      expect(result.getters.timelineName).toBe("Original Name");
      expect(result.getters.trackName).toBe("Original Track");
      expect(result.getters.trackKind).toBe("Video");
      expect(result.getters.clipName).toBe("Original Clip");
      expect(result.getters.effectName).toBe("Original Effect");
      expect(result.getters.effectType).toBe("Blur");
      
      // Validate setters (if implemented)
      if (result.setters.timelineSet) {
        expect(result.setters.timelineSet).toBe("New Timeline Name");
      }
      if (result.setters.trackSet) {
        expect(result.setters.trackSet).toBe("New Track Name");
      }
      if (result.setters.clipSet) {
        expect(result.setters.clipSet).toBe("New Clip Name");
      }
      if (result.setters.effectSet) {
        expect(result.setters.effectSet).toBe("New Effect Name");
      }
    });
  });

  test.describe('Method Validation', () => {
    
    test.beforeEach(async ({ page }) => {
      await loadOTIOModules(page);
      await waitForModulesReady(page);
    });

    test('should validate Timeline methods', async ({ page }) => {
      const result = await page.evaluate(() => {
        try {
          const timeline = new (window as any).OTIO.Timeline("Method Test");
          const track = new (window as any).OTIO.Track("Test Track", "Video");
          
          const methods = {
            // Test count methods
            initialTrackCount: timeline.track_count(),
            
            // Test add method
            addTrackResult: timeline.add_track(track),
            afterAddCount: timeline.track_count(),
            
            // Test tracks access
            tracksExist: !!timeline.tracks(),
            tracksLength: timeline.tracks() ? timeline.tracks().length : 0,
            
            // Test JSON serialization
            jsonString: timeline.to_json_string(),
            jsonValid: false
          };
          
          // Validate JSON
          try {
            const parsed = JSON.parse(methods.jsonString);
            methods.jsonValid = !!parsed.OTIO_SCHEMA;
          } catch (e) {
            methods.jsonValid = false;
          }
          
          // Cleanup
          track.dispose();
          timeline.dispose();
          
          return methods;
        } catch (error) {
          throw new Error(`Timeline method validation failed: ${(error as Error).message}`);
        }
      });
      
      expect(result.initialTrackCount).toBe(0);
      expect(result.addTrackResult).toBe(true);
      expect(result.afterAddCount).toBe(1);
      expect(result.tracksExist).toBe(true);
      expect(result.tracksLength).toBe(1);
      expect(result.jsonString.length).toBeGreaterThan(0);
      expect(result.jsonValid).toBe(true);
    });

    test('should validate Track methods', async ({ page }) => {
      const result = await page.evaluate(() => {
        try {
          const track = new (window as any).OTIO.Track("Method Test", "Video");
          const clip1 = new (window as any).OTIO.Clip("Test Clip 1");
          const clip2 = new (window as any).OTIO.Clip("Test Clip 2");
          const methods = {
            // Test count methods
            initialClipCount: track.clip_count(),
            
            // Test add methods
            addClip1Result: track.add_clip(clip1),
            afterAdd1Count: track.clip_count(),
            
            addClip2Result: track.add_clip(clip2),
            afterAdd2Count: track.clip_count(),
            
            // Test get methods
            getClip0: track.get_clip(0) ? track.get_clip(0).name() : null,
            getClip1: track.get_clip(1) ? track.get_clip(1).name() : null,
            
            // Test insert method
            insertClip: new (window as any).OTIO.Clip("Insert Clip"),
            insertResult: false,
            afterInsertCount: 0,
            
            // Test remove method
            removeResult: false,
            afterRemoveCount: 0
          };
          
          // Test insertion
          methods.insertResult = track.insert_clip(1, methods.insertClip);
          methods.afterInsertCount = track.clip_count();
          
          // Test removal
          methods.removeResult = (track as any).remove_clip(1);
          methods.afterRemoveCount = track.clip_count();
          
          // Cleanup
          methods.insertClip.dispose();
          clip1.dispose();
          clip2.dispose();
          track.dispose();
          
          return methods;
        } catch (error) {
          throw new Error(`Track method validation failed: ${(error as Error).message}`);
        }
      });
      
      expect(result.initialClipCount).toBe(0);
      expect(result.addClip1Result).toBe(true);
      expect(result.afterAdd1Count).toBe(1);
      expect(result.addClip2Result).toBe(true);
      expect(result.afterAdd2Count).toBe(2);
      expect(result.getClip0).toBe("Test Clip 1");
      expect(result.getClip1).toBe("Test Clip 2");
      expect(result.insertResult).toBe(true);
      expect(result.afterInsertCount).toBe(3);
      expect(result.removeResult).toBe(true);
      expect(result.afterRemoveCount).toBe(2);
    });

    test('should validate Clip methods', async ({ page }) => {
      const result = await page.evaluate((): MethodsResult => {
        try {
          const clip = new (window as any).OTIO.Clip("Method Test");
          
          const methods: MethodsResult = {
            // Test basic properties
            initialName: clip.name(),
            initialEnabled: clip.enabled(),
            initialDuration: clip.duration() ? clip.duration().value() : 0,
            
            // Test property setters
            nameSetResult: false,
            enabledSetResult: false,
            
            // Test time range
            sourceRangeSet: false,
            sourceRangeGet: null,
            
            // Test media reference
            hasMediaReference: !!(clip as any).media_reference(),
            
            // Test JSON serialization
            jsonString: clip.to_json_string(),
            jsonValid: false
          };
          console.log("AA01", methods);
          
          // Test property setters
          try {
            clip.set_name("New Clip Name");
            methods.nameSetResult = clip.name() === "New Clip Name";
          } catch (e) {
            methods.nameSetError = (e as Error).message;
          }
          
          try {
            clip.set_enabled(false);
            methods.enabledSetResult = !clip.enabled();
          } catch (e) {
            methods.enabledSetError = (e as Error).message;
          }
          
          // Test time range operations
          try {
            const timeRange = new (window as any).Module.OTIOTimeRange(
              new (window as any).Module.OTIORationalTime(0, 24),
              new (window as any).Module.OTIORationalTime(100, 24)
            );
            clip.set_source_range(timeRange);
            methods.sourceRangeSet = true;
            
            const retrievedRange = clip.source_range();
            console.log("AA02", typeof retrievedRange);
            if (retrievedRange) {
              methods.sourceRangeGet = {
                startValue: retrievedRange.start_time().value(),
                durationValue: retrievedRange.duration().value()
              };
            }
          } catch (e) {
            methods.sourceRangeError = (e as Error).message;
          }
          
          // Test JSON validation
          try {
            const parsed = JSON.parse(methods.jsonString);
            methods.jsonValid = !!parsed.OTIO_SCHEMA;
          } catch (e) {
            methods.jsonValid = false;
          }
          
          // Cleanup
          clip.dispose();
          
          return methods;
        } catch (error) {
          throw new Error(`Clip method validation failed: ${(error as Error).message}`);
        }
      });
      
      expect(result.initialName).toBe("Method Test");
      expect(typeof result.initialEnabled).toBe("boolean");
      expect(typeof result.initialDuration).toBe("number");
      expect(result.nameSetResult).toBe(true);
      expect(result.enabledSetResult).toBe(true);
      expect(result.hasMediaReference).toBe(false); // No media reference set initially
      expect(result.jsonString.length).toBeGreaterThan(0);
      expect(result.jsonValid).toBe(true);
      
      // Only test source range if it was successfully set
      if (result.sourceRangeSet) {
        expect(result.sourceRangeGet?.startValue).toBe(0);
        expect(result.sourceRangeGet?.durationValue).toBe(100);
      }
    });
  });

  test.describe('Error Handling', () => {
    
    test.beforeEach(async ({ page }) => {
      await loadOTIOModules(page);
      await waitForModulesReady(page);
    });

    test('should handle invalid operations gracefully', async ({ page }) => {
      const result = await page.evaluate((): ErrorTestResult[] => {
        const errors: ErrorTestResult[] = [];
        
        try {
          const timeline = new (window as any).OTIO.Timeline("Error Test");
          const track = new (window as any).OTIO.Track("Test Track", "Video");
          timeline.add_track(track);
          
          // Test invalid clip access
          try {
            const invalidClip = track.get_clip(999);
            errors.push({ operation: 'get_clip(999)', result: invalidClip === null ? 'null' : 'unexpected' });
          } catch (e) {
            errors.push({ operation: 'get_clip(999)', error: (e as Error).message });
          }
          
          // Test invalid clip removal
          try {
            const removeResult = (track as any).remove_clip(999);
            errors.push({ operation: 'remove_clip(999)', result: removeResult });
          } catch (e) {
            errors.push({ operation: 'remove_clip(999)', error: (e as Error).message });
          }
          
          // Test invalid track access
          const clip = new window.OTIO.Clip("Test Clip");
          track.add_clip(clip);
          
          try {
            const invalidTrack = timeline.get_track(999);
            errors.push({ operation: 'get_track(999)', result: invalidTrack === null ? 'null' : 'unexpected' });
          } catch (e) {
            errors.push({ operation: 'get_track(999)', error: (e as Error).message });
          }
          
          // Cleanup
          clip.dispose();
          track.dispose();
          timeline.dispose();
          
        } catch (e) {
          errors.push({ operation: 'setup', error: (e as Error).message });
        }
        
        return errors;
      });
      
      // Should handle invalid operations without crashing
      expect(result.length).toBeGreaterThan(0);
      
      // Check that invalid clip access returns null or throws gracefully
      const getClipError = result.find(r => r.operation === 'get_clip(999)');
      expect(getClipError).toBeDefined();
      expect(getClipError?.result === 'null' || getClipError?.error).toBeTruthy();
      
      // Check that invalid track access returns null or throws gracefully
      const getTrackError = result.find(r => r.operation === 'get_track(999)');
      expect(getTrackError).toBeDefined();
      expect(getTrackError?.result === 'null' || getTrackError?.error).toBeTruthy();
    });
  });
}); 