# OpenTimelineIO TypeScript/JavaScript Bindings

This package provides TypeScript/JavaScript bindings for [OpenTimelineIO](https://github.com/AcademySoftwareFoundation/OpenTimelineIO), compiled to WebAssembly using Emscripten.

## Installation

```bash
npm install opentimelineio
```

## Usage

### Basic Example

```typescript
import { Timeline, Track, Clip, RationalTime, TimeRange } from 'opentimelineio';

// Create a timeline
const timeline = new Timeline("My Timeline");

// Create a track
const track = new Track("V1");

// Create a clip
const clip = new Clip("My Clip");
clip.set_source_range(new TimeRange(
  RationalTime.from_seconds(0, 24),
  RationalTime.from_seconds(5, 24)
));

// Add the clip to the track (you would need to implement the collection methods)
// track.append(clip);

// Add the track to the timeline
// timeline.tracks().append(track);

// Serialize to JSON
console.log(timeline.to_json_string());
```

### Working with Time

```typescript
import { RationalTime, TimeRange } from 'opentimelineio';

// Create time values
const time1 = new RationalTime(24, 24); // 1 second at 24fps
const time2 = RationalTime.from_seconds(2.5, 24); // 2.5 seconds at 24fps

// Create a time range
const range = new TimeRange(time1, time2);

// Time arithmetic
const sum = add(time1, time2);
const scaled = multiply(time1, 2);
```

## API Reference

The TypeScript bindings closely follow the C++ API. See the [OpenTimelineIO documentation](https://opentimelineio.readthedocs.io/) for detailed API documentation.

### Key Classes

- **Timeline**: The root object containing tracks
- **Track**: Contains clips and other items
- **Clip**: Represents a piece of media with timing
- **RationalTime**: Represents time as a rational number
- **TimeRange**: Represents a range of time
- **MediaReference**: References to external media files

## Building from Source

To build the TypeScript bindings from source:

1. Install Emscripten SDK
2. Configure the build with Emscripten:
   ```bash
   emcmake cmake -B build-wasm -S . -DOTIO_TYPESCRIPT_INSTALL=ON
   cmake --build build-wasm
   ```

## License

OpenTimelineIO is licensed under the Apache 2.0 license. See [LICENSE](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/blob/main/LICENSE) for details. 