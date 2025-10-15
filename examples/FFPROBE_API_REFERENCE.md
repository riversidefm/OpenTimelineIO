# FFProbe Utils API Reference

Quick reference for the essential ffprobe utilities available to OTIO adapters.

## Essential Properties

The ffprobe utilities focus on these 6 essential media properties:

1. **duration** - Media duration in seconds (float)
2. **width** - Video width in pixels (int)
3. **height** - Video height in pixels (int)
4. **framerate** - Video framerate/fps (float)
5. **samplerate** - Audio sample rate in Hz (int)
6. **channels** - Number of audio channels (int)

## Direct Usage

```python
import opentimelineio as otio

# Get media properties (all cached automatically)
duration = otio.adapters.ffprobe_utils.get_duration(filepath)        # float or None
width = otio.adapters.ffprobe_utils.get_width(filepath)              # int or None
height = otio.adapters.ffprobe_utils.get_height(filepath)            # int or None
framerate = otio.adapters.ffprobe_utils.get_framerate(filepath)      # float or None
samplerate = otio.adapters.ffprobe_utils.get_samplerate(filepath)    # int or None
channels = otio.adapters.ffprobe_utils.get_channels(filepath)        # int or None

# Utilities
is_installed = otio.adapters.ffprobe_utils.verify_ffprobe_installed()  # bool
otio.adapters.ffprobe_utils.clear_cache()  # Clear the cache
```

## Adapter Class Methods

When writing an adapter, use the convenience methods on the `Adapter` base class:

```python
from opentimelineio.adapters import Adapter

class MyAdapter(Adapter):
    def read_from_file(self, filepath, **kwargs):
        # All methods are static, so you can call them on self or the class
        duration = self.ffprobe_get_duration(filepath)
        width = self.ffprobe_get_width(filepath)
        height = self.ffprobe_get_height(filepath)
        framerate = self.ffprobe_get_framerate(filepath)
        samplerate = self.ffprobe_get_samplerate(filepath)
        channels = self.ffprobe_get_channels(filepath)

        # Use these to build your timeline...
```

## Function Signatures

All query functions follow the same pattern:

```python
def get_property(filepath: str, use_cache: bool = True) -> Optional[Type]:
    """Get property from media file.

    Args:
        filepath: Path to the media file
        use_cache: If True, use cached results if available (default: True)

    Returns:
        Property value or None if not available

    Raises:
        FFProbeNotFoundError: If ffprobe is not found
        FFProbeCommandError: If ffprobe command fails
        FileNotFoundError: If the media file doesn't exist
    """
```

## Return Types

- `get_duration()` → `Optional[float]` - seconds
- `get_width()` → `Optional[int]` - pixels
- `get_height()` → `Optional[int]` - pixels
- `get_framerate()` → `Optional[float]` - fps (e.g., 24.0, 29.97, 59.94)
- `get_samplerate()` → `Optional[int]` - Hz (e.g., 48000, 44100)
- `get_channels()` → `Optional[int]` - count (e.g., 1, 2, 6, 8)

## Caching Behavior

- All queries are cached by absolute file path
- The first call to any property queries ffprobe once
- All subsequent calls for that file are instant (cached)
- The cache is shared across all code in your Python process
- Video properties share the same cache entry as audio properties
- Use `use_cache=False` to force a fresh query
- Use `clear_cache()` to clear all cached data

## Error Handling

```python
try:
    duration = otio.adapters.ffprobe_utils.get_duration(filepath)
except otio.adapters.ffprobe_utils.FFProbeNotFoundError:
    print("ffprobe not installed")
except otio.adapters.ffprobe_utils.FFProbeCommandError as e:
    print(f"ffprobe failed: {e}")
except FileNotFoundError:
    print("File not found")
```

## Example: Complete Adapter Pattern

```python
import opentimelineio as otio

def read_from_file(filepath, **kwargs):
    """Example adapter that uses all ffprobe utilities."""

    # Verify ffprobe is available
    if not otio.adapters.ffprobe_utils.verify_ffprobe_installed():
        raise RuntimeError("ffprobe is required but not installed")

    # Get all properties (single ffprobe call, cached)
    duration = otio.adapters.ffprobe_utils.get_duration(filepath)
    width = otio.adapters.ffprobe_utils.get_width(filepath)
    height = otio.adapters.ffprobe_utils.get_height(filepath)
    fps = otio.adapters.ffprobe_utils.get_framerate(filepath)
    samplerate = otio.adapters.ffprobe_utils.get_samplerate(filepath)
    channels = otio.adapters.ffprobe_utils.get_channels(filepath)

    # Build timeline
    timeline = otio.schema.Timeline(name=os.path.basename(filepath))
    track = otio.schema.Track()

    # Create time range if we have duration and fps
    if duration and fps:
        available_range = otio.opentime.TimeRange(
            start_time=otio.opentime.RationalTime(0, fps),
            duration=otio.opentime.RationalTime(duration, 1).rescaled_to(fps)
        )
    else:
        available_range = None

    # Create clip
    clip = otio.schema.Clip(name=os.path.basename(filepath))
    clip.media_reference = otio.schema.ExternalReference(
        target_url=filepath,
        available_range=available_range
    )

    # Store all media properties in metadata
    clip.metadata.update({
        'width': width,
        'height': height,
        'framerate': fps,
        'samplerate': samplerate,
        'channels': channels,
        'duration': duration
    })

    track.append(clip)
    timeline.tracks.append(track)

    return timeline
```

## Performance Tips

1. **Let caching work**: Don't disable caching unless necessary
2. **Query once**: All properties are cached together, so query what you need
3. **Batch processing**: The cache helps when processing multiple files
4. **Clear when needed**: If files are modified, call `clear_cache()`

## Testing

To test your adapter without ffprobe:

```python
# Mock the utilities
import unittest.mock as mock

with mock.patch('opentimelineio.adapters.ffprobe_utils.get_duration', return_value=120.0):
    with mock.patch('opentimelineio.adapters.ffprobe_utils.get_framerate', return_value=24.0):
        # Test your adapter code
        pass
```

