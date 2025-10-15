#!/usr/bin/env python
#
# SPDX-License-Identifier: Apache-2.0
# Copyright Contributors to the OpenTimelineIO project

"""Example demonstrating the use of OTIO's cached ffprobe utilities.

This example shows how adapters (or any other code) can use the ffprobe
utilities provided by OpenTimelineIO to query essential media file properties
with automatic caching for improved performance.

Essential properties queried:
- width, height (video resolution)
- framerate (video fps)
- samplerate (audio sample rate)
- channels (number of audio channels)
- duration (media duration in seconds)
"""

import sys
import argparse

import opentimelineio as otio


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Query media file properties using OTIO's cached ffprobe utilities"
    )
    parser.add_argument(
        'filepath',
        type=str,
        help='Path to media file to analyze'
    )
    parser.add_argument(
        '--no-cache',
        action='store_true',
        default=False,
        help='Disable caching (query ffprobe each time)'
    )
    return parser.parse_args()


def main():
    """Main function demonstrating ffprobe utility usage."""
    args = parse_args()
    use_cache = not args.no_cache

    # First, verify ffprobe is installed
    if not otio.adapters.ffprobe_utils.verify_ffprobe_installed():
        print("ERROR: ffprobe is not installed or not in PATH")
        print("Please install ffmpeg from https://www.ffmpeg.org")
        return 1

    print(f"\nAnalyzing: {args.filepath}")
    print("=" * 60)

    try:
        # Get duration
        print("\n1. Getting duration...")
        duration = otio.adapters.ffprobe_utils.get_duration(
            args.filepath,
            use_cache=use_cache
        )
        if duration:
            print(f"   Duration: {duration:.3f} seconds")
        else:
            print("   Duration: Unknown")

        # Get video width
        print("\n2. Getting video width...")
        width = otio.adapters.ffprobe_utils.get_width(
            args.filepath,
            use_cache=use_cache
        )
        if width:
            print(f"   Width: {width} pixels")
        else:
            print("   Width: Unknown (not a video or no video stream)")

        # Get video height
        print("\n3. Getting video height...")
        height = otio.adapters.ffprobe_utils.get_height(
            args.filepath,
            use_cache=use_cache
        )
        if height:
            print(f"   Height: {height} pixels")
        else:
            print("   Height: Unknown (not a video or no video stream)")

        # Get framerate
        print("\n4. Getting framerate...")
        fps = otio.adapters.ffprobe_utils.get_framerate(
            args.filepath,
            use_cache=use_cache
        )
        if fps:
            print(f"   Framerate: {fps:.3f} fps")
        else:
            print("   Framerate: Unknown (not a video or no video stream)")

        # Get audio sample rate
        print("\n5. Getting audio sample rate...")
        samplerate = otio.adapters.ffprobe_utils.get_samplerate(
            args.filepath,
            use_cache=use_cache
        )
        if samplerate:
            print(f"   Sample rate: {samplerate} Hz")
        else:
            print("   Sample rate: Unknown (no audio stream)")

        # Get number of audio channels
        print("\n6. Getting number of audio channels...")
        channels = otio.adapters.ffprobe_utils.get_channels(
            args.filepath,
            use_cache=use_cache
        )
        if channels:
            print(f"   Channels: {channels}")
        else:
            print("   Channels: Unknown (no audio stream)")

        # Demonstrate cache effectiveness
        if use_cache:
            print("\n7. Demonstrating cache (re-querying all properties)...")
            # These should all be instant because they're cached
            duration2 = otio.adapters.ffprobe_utils.get_duration(args.filepath, use_cache=True)
            width2 = otio.adapters.ffprobe_utils.get_width(args.filepath, use_cache=True)
            height2 = otio.adapters.ffprobe_utils.get_height(args.filepath, use_cache=True)
            print(f"   Cached queries returned instantly!")
            print(f"   Duration: {duration2:.3f}s, Resolution: {width2}x{height2}")

        print("\n" + "=" * 60)
        print("Analysis complete!")

        # Example: How adapters can use this in their code
        print("\n" + "=" * 60)
        print("Example adapter usage:")
        print("=" * 60)
        print("""
# In your adapter's read_from_file() function:

def read_from_file(filepath, **kwargs):
    # Get essential media properties using cached ffprobe
    duration = otio.adapters.ffprobe_utils.get_duration(filepath)
    width = otio.adapters.ffprobe_utils.get_width(filepath)
    height = otio.adapters.ffprobe_utils.get_height(filepath)
    fps = otio.adapters.ffprobe_utils.get_framerate(filepath)
    samplerate = otio.adapters.ffprobe_utils.get_samplerate(filepath)
    channels = otio.adapters.ffprobe_utils.get_channels(filepath)

    # Create OTIO objects with the information
    timeline = otio.schema.Timeline()
    track = otio.schema.Track()

    available_range = otio.opentime.TimeRange(
        otio.opentime.RationalTime(0, fps),
        otio.opentime.RationalTime(duration, 1).rescaled_to(fps)
    )

    clip = otio.schema.Clip()
    clip.media_reference = otio.schema.ExternalReference(
        target_url=filepath,
        available_range=available_range
    )

    # Store additional metadata
    clip.metadata['width'] = width
    clip.metadata['height'] = height
    clip.metadata['samplerate'] = samplerate
    clip.metadata['channels'] = channels

    track.append(clip)
    timeline.tracks.append(track)

    return timeline

# Or, use the convenience methods on the Adapter class:

class MyAdapter(otio.adapters.Adapter):
    def read_from_file(self, filepath, **kwargs):
        # These are static methods on the Adapter base class
        duration = self.ffprobe_get_duration(filepath)
        width = self.ffprobe_get_width(filepath)
        height = self.ffprobe_get_height(filepath)
        fps = self.ffprobe_get_framerate(filepath)
        samplerate = self.ffprobe_get_samplerate(filepath)
        channels = self.ffprobe_get_channels(filepath)
        # ... rest of your code
        """)

        return 0

    except otio.adapters.ffprobe_utils.FFProbeNotFoundError as e:
        print(f"\nERROR: {e}")
        return 1
    except otio.adapters.ffprobe_utils.FFProbeCommandError as e:
        print(f"\nERROR: {e}")
        return 1
    except otio.adapters.ffprobe_utils.FFProbeError as e:
        print(f"\nERROR: {e}")
        return 1
    except FileNotFoundError as e:
        print(f"\nERROR: {e}")
        return 1
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())

