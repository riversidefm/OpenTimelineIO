# FFProbe Utilities Usage Guide

OpenTimelineIO provides cached ffprobe utilities that adapters and other code can use to query media file properties efficiently.

## Features

- **Automatic Caching**: Results are cached automatically to avoid redundant subprocess calls
- **Easy to Use**: Simple API for common media queries
- **Adapter Integration**: Built-in convenience methods on the `Adapter` base class
- **Comprehensive**: Query duration, framerate, resolution, codec info, and detect scene changes

## Quick Start

### Basic Usage

```python
import opentimelineio as otio

# Get duration of a media file
duration = otio.adapters.ffprobe_utils.get_duration("video.mp4")
print(f"Duration: {duration} seconds")

# Get framerate
fps = otio.adapters.ffprobe_utils.get_framerate("video.mp4")
print(f"Framerate: {fps}")

# Get resolution
width, height = otio.adapters.ffprobe_utils.get_resolution("video.mp4")
print(f"Resolution: {width}x{height}")

# Get codec information
codec_info = otio.adapters.ffprobe_utils.get_codec_info("video.mp4")
print(f"Video codec: {codec_info['video_codec']}")
print(f"Audio codec: {codec_info['audio_codec']}")
```

### Using in Adapters

Adapters can use the convenience methods on the `Adapter` base class:

```python
from opentimelineio.adapters import Adapter

class MyCustomAdapter(Adapter):
    def read_from_file(self, filepath, **kwargs):
        # Use the static methods from the Adapter base class
        duration = self.ffprobe_get_duration(filepath)
        fps = self.ffprobe_get_framerate(filepath)
        resolution = self.ffprobe_get_resolution(filepath)

        # Create your OTIO timeline using this information
        # ...
```

Or import the utilities directly:

```python
import opentimelineio as otio

def read_from_file(filepath, **kwargs):
    # Direct access to ffprobe utilities
    duration = otio.adapters.ffprobe_utils.get_duration(filepath)
    fps = otio.adapters.ffprobe_utils.get_framerate(filepath)

    # Build your timeline
    # ...
```

## Available Functions

### Verification

- `verify_ffprobe_installed()` - Check if ffprobe is available on the system

### Media Information

- `get_media_info(filepath, use_cache=True)` - Get complete media info as JSON
- `get_duration(filepath, use_cache=True)` - Get duration in seconds
- `get_framerate(filepath, use_cache=True)` - Get framerate (fps)
- `get_resolution(filepath, use_cache=True)` - Get (width, height) tuple
- `get_codec_info(filepath, use_cache=True)` - Get video/audio codec information
- `get_scene_changes(filepath, threshold=0.4, use_cache=True)` - Detect scene changes

### Cache Management

- `clear_cache()` - Clear the ffprobe cache (useful if media files are modified)

## Adapter Base Class Convenience Methods

The `Adapter` class provides static methods that wrap the ffprobe utilities:

- `Adapter.ffprobe_verify_installed()`
- `Adapter.ffprobe_get_media_info(filepath, use_cache=True)`
- `Adapter.ffprobe_get_duration(filepath, use_cache=True)`
- `Adapter.ffprobe_get_framerate(filepath, use_cache=True)`
- `Adapter.ffprobe_get_resolution(filepath, use_cache=True)`
- `Adapter.ffprobe_get_codec_info(filepath, use_cache=True)`
- `Adapter.ffprobe_get_scene_changes(filepath, threshold=0.4, use_cache=True)`
- `Adapter.ffprobe_clear_cache()`

## Examples

### Example 1: Query Media Properties

See `ffprobe_example.py` for a complete example that demonstrates all the available functions.

Run it with:
```bash
python examples/ffprobe_example.py path/to/video.mp4
```

### Example 2: Scene Detection

See `shot_detect.py` for an example that uses the cached ffprobe utilities to detect scene changes and create a timeline with individual clips for each shot.

Run it with:
```bash
python examples/shot_detect.py path/to/video.mp4
```

## Caching Behavior

By default, all ffprobe queries are cached based on the absolute path to the media file. This means:

1. The first query to a file will call ffprobe
2. Subsequent queries to the same file will return cached results instantly
3. Different query types (duration, fps, etc.) all share the same underlying media info cache

To disable caching for a specific query:
```python
duration = otio.adapters.ffprobe_utils.get_duration("video.mp4", use_cache=False)
```

To clear the entire cache (e.g., if files have been modified):
```python
otio.adapters.ffprobe_utils.clear_cache()
```

## Error Handling

The ffprobe utilities raise specific exceptions:

- `FFProbeNotFoundError` - ffprobe is not installed or not in PATH
- `FFProbeCommandError` - ffprobe command failed (e.g., corrupt media file)
- `FFProbeError` - Base exception for all ffprobe errors

Example error handling:

```python
import opentimelineio as otio

try:
    duration = otio.adapters.ffprobe_utils.get_duration("video.mp4")
except otio.adapters.ffprobe_utils.FFProbeNotFoundError:
    print("Please install ffmpeg")
except otio.adapters.ffprobe_utils.FFProbeCommandError as e:
    print(f"Failed to query file: {e}")
except FileNotFoundError:
    print("File not found")
```

## Requirements

FFProbe (part of FFmpeg) must be installed and available in your system PATH.

Download from: https://www.ffmpeg.org

## Performance Notes

- The caching is in-memory for the duration of your Python process
- Scene detection is computationally expensive and may take a while for large files
- The cache is shared across all adapter instances and code using the utilities
- Use `use_cache=False` sparingly as it will run ffprobe every time

## Implementation Details

The ffprobe utilities are located in:
- Module: `opentimelineio.adapters.ffprobe_utils`
- Convenience methods: `opentimelineio.adapters.Adapter` class

The utilities use `subprocess` to call ffprobe and parse the JSON output. All paths are converted to absolute paths for consistent cache keys.

