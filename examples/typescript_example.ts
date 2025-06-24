// SPDX-License-Identifier: Apache-2.0
// Copyright Contributors to the OpenTimelineIO project

/**
 * Example of using OpenTimelineIO TypeScript bindings
 * 
 * This example demonstrates basic usage of the OTIO TypeScript/WASM bindings
 * including creating timelines, clips, and working with time values.
 */

// This would be the actual import in a real application:
// import { Timeline, Track, Clip, RationalTime, TimeRange, ExternalReference } from 'opentimelineio';

// For this example, we'll declare the types we're using
declare interface RationalTime {
  value(): number;
  rate(): number;
}

declare interface RationalTimeConstructor {
  new(): RationalTime;
  new(value: number, rate: number): RationalTime;
  from_seconds(seconds: number, rate: number): RationalTime;
}

declare interface TimeRange {
  start_time: RationalTime;
  duration: RationalTime;
  end_time_exclusive(): RationalTime;
}

declare interface Timeline {
  name(): string;
  to_json_string(indent?: number): string;
}

declare interface Track {
  set_kind(kind: string): void;
}

declare interface Clip {
  name(): string;
  set_media_reference(ref: any): void;
  set_source_range(range: TimeRange): void;
  source_range(): TimeRange;
}

declare interface ExternalReference {
  constructor(url: string): ExternalReference;
}

/**
 * Example function to test basic functionality
 */
async function testBasicFunctionality() {
  const Module = (globalThis as any).OpenTimelineIOModule;
  
  console.log("Testing basic functionality...");
  
  // Test simple functions
  const version = Module.get_version();
  const connected = Module.test_connection();
  
  console.log(`Version: ${version}`);
  console.log(`Connection test: ${connected}`);
  
  return { version, connected };
}

/**
 * Example function demonstrating time arithmetic
 */
async function timeArithmeticExample() {
  const Module = (globalThis as any).OpenTimelineIOModule;
  
  console.log("\nTime arithmetic examples:");
  
  // Create some time values
  const time1 = new Module.RationalTime(24, 24); // 1 second at 24fps
  const time2 = Module.RationalTime.from_seconds(2.5, 24); // 2.5 seconds at 24fps
  
  console.log(`Time 1: ${time1.value()}/${time1.rate()}`);
  console.log(`Time 2: ${time2.value()}/${time2.rate()}`);
  
  // Time arithmetic
  const sum = Module.add(time1, time2);
  const difference = Module.subtract(time2, time1);
  
  // Time conversions
  const time1InSeconds = time1.value() / time1.rate();
  const time2InSeconds = time2.value() / time2.rate();
  
  console.log(`Time 1 in seconds: ${time1InSeconds}`);
  console.log(`Time 2 in seconds: ${time2InSeconds}`);
  
  // Time range operations
  const range = new Module.TimeRange(time1, time2);
  console.log(`Range start: ${range.start_time.value()}/${range.start_time.rate()}`);
  console.log(`Range duration: ${range.duration.value()}/${range.duration.rate()}`);
  console.log(`Range end (exclusive): ${range.end_time_exclusive().value()}/${range.end_time_exclusive().rate()}`);
}

/**
 * Example function for loading a timeline from JSON
 */
async function loadTimelineFromJson() {
  const Module = (globalThis as any).OpenTimelineIOModule;
  
  console.log("\nLoading timeline from JSON...");
  
  // Example JSON (simplified)
  const exampleJson = `{
    "OTIO_SCHEMA": "Timeline.1",
    "metadata": {},
    "name": "JSON Timeline",
    "tracks": {
      "OTIO_SCHEMA": "Stack.1",
      "children": [],
      "metadata": {},
      "name": "tracks"
    }
  }`;
  
  try {
    // Note: In a complete implementation, you would use:
    // const timeline = Module.deserialize_json_from_string(exampleJson);
    console.log("JSON parsing would happen here");
    console.log("Input JSON:", exampleJson);
  } catch (error) {
    console.error("Error parsing JSON:", error);
  }
}

/**
 * Main function to run all examples
 */
async function main() {
  console.log("OpenTimelineIO TypeScript Example");
  console.log("==================================");
  
  try {
    // Check if the WASM module is loaded
    if (typeof (globalThis as any).OpenTimelineIOModule === 'undefined') {
      console.log("Please load the OpenTimelineIO WASM module first");
      console.log("In a browser: <script src='opentimelineio.js'></script>");
      console.log("In Node.js: const Module = await require('./opentimelineio.js')();");
      return;
    }
    
    await testBasicFunctionality();
    await timeArithmeticExample();
    await loadTimelineFromJson();
    
    console.log("\nExample completed successfully!");
    
  } catch (error) {
    console.error("Error running example:", error);
  }
}

// Export the main function for use in other contexts
export { main, testBasicFunctionality, timeArithmeticExample, loadTimelineFromJson };

// If running directly (not imported), run the main function
declare const require: any;
declare const module: any;

if (typeof require !== 'undefined' && require.main === module) {
  main();
} 