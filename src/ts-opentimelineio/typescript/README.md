# OpenTimelineIO TypeScript/JavaScript Bindings

TypeScript/JavaScript bindings for [OpenTimelineIO](http://opentimelineio.io/) using WebAssembly (WASM).

## Installation

```bash
# From GitHub Packages
npm install @riversidefm/opentimelineio
```

## Quick Start

### Node.js

```javascript
const initializeOTIO = require('@riversidefm/opentimelineio');

async function example() {
  // Initialize the modules
  const { OpenTime, OTIO } = await initializeOTIO();
  
  // Create a timeline
  const timeline = new OTIO.Timeline("My Project");
  
  // Create time values (24fps)
  const startTime = new OpenTime.RationalTime(0, 24);
  const duration = new OpenTime.RationalTime(120, 24); // 5 seconds
  const range = new OpenTime.TimeRange(startTime, duration);
  
  // Create a clip
  const clip = new OTIO.Clip("Shot_01");
  clip.set_source_range(range);
  
  // Create media reference
  const mediaRef = new OTIO.ExternalReference("file:///path/to/media.mov");
  clip.set_media_reference(mediaRef);
  
  // Export to JSON
  console.log(timeline.to_json_string());
  
  // Clean up (important for memory management)
  mediaRef.dispose();
  clip.dispose();
  timeline.dispose();
}

example().catch(console.error);
```

### Browser

```html
<!DOCTYPE html>
<html>
<head>
    <script src="node_modules/@riversidefm/opentimelineio/dist/opentime.js"></script>
    <script src="node_modules/@riversidefm/opentimelineio/dist/opentimelineio.js"></script>
    <script src="node_modules/@riversidefm/opentimelineio/wrappers.js"></script>
</head>
<body>
    <script>
    async function example() {
        // Initialize modules
        const OpenTime = await window.OpenTimeModule();
        const OTIO = await window.OpenTimelineIOModule();
        window.Module = OTIO; // Required for wrapper classes
        
        // Create timeline
        const timeline = new window.OTIO.Timeline("My Project");
        
        // Create clip with time range
        const clip = new window.OTIO.Clip("Shot_01");
        const range = new OpenTime.TimeRange(
            new OpenTime.RationalTime(0, 24),
            new OpenTime.RationalTime(120, 24)
        );
        clip.set_source_range(range);
        
        console.log("Timeline:", timeline.name());
        console.log("JSON:", timeline.to_json_string());
        
        // Clean up
        clip.dispose();
        timeline.dispose();
    }
    
    example().catch(console.error);
    </script>
</body>
</html>
```

## Architecture

The bindings use a two-layer architecture:

1. **WASM Layer**: Direct C++ bindings compiled to WebAssembly
2. **Wrapper Layer**: JavaScript classes providing a clean object-oriented API

This design works around OpenTimelineIO's reference counting system where core classes have protected destructors.

## API Reference

### Core Classes

- **Timeline**: Top-level container for tracks
- **Track**: Container for clips (video/audio tracks)
- **Clip**: References to media with timing information
- **ExternalReference**: File-based media references

### Time Classes (OpenTime module)

- **RationalTime**: Precise time representation (value/rate)
- **TimeRange**: Time range with start time and duration
- **TimeTransform**: Time transformations (offset/scale)

### Key Methods

```javascript
// Timeline
const timeline = new OTIO.Timeline("name");
timeline.name()                    // Get name
timeline.set_name("new name")      // Set name
timeline.duration()                // Get duration as RationalTime
timeline.to_json_string()          // Export to JSON
timeline.dispose()                 // Clean up memory

// Time operations
const time = new OpenTime.RationalTime(24, 24); // 1 second at 24fps
time.value()                       // Get frame value
time.rate()                        // Get frame rate
time.to_seconds()                  // Convert to seconds

// Time arithmetic
const sum = OpenTime.add(time1, time2);
const diff = OpenTime.subtract(time1, time2);
```

## Memory Management

⚠️ **Important**: Always call `dispose()` on objects when done to prevent memory leaks:

```javascript
const timeline = new OTIO.Timeline("test");
// ... use timeline ...
timeline.dispose(); // Required!
```

## TypeScript Support

Full TypeScript definitions are included:

```typescript
import { Timeline, RationalTime, TimeRange } from '@riversidefm/opentimelineio';

// Types are automatically available
const timeline: Timeline = new OTIO.Timeline("typed");
const time: RationalTime = new OpenTime.RationalTime(24, 24);
```
