# SPDX-License-Identifier: Apache-2.0
# Copyright Contributors to the OpenTimelineIO project

"""FFProbe utility functions with caching support for use by adapters.

This module provides essential media property queries with built-in caching to avoid
redundant subprocess calls when querying the same media files multiple times.

Essential properties available:
- width, height (video resolution)
- framerate (video fps)
- samplerate (audio sample rate)
- channels (number of audio channels)
- duration (media duration in seconds)
"""

import subprocess
import json
import os
from typing import Optional, Dict, Any, Tuple


class FFProbeError(Exception):
    """Base exception for FFProbe-related errors."""
    pass


class FFProbeNotFoundError(FFProbeError):
    """Raised when ffprobe executable cannot be found."""
    pass


class FFProbeCommandError(FFProbeError):
    """Raised when ffprobe command fails."""
    pass


# Global cache for ffprobe results
# Key: (filepath, cache_key), Value: result
_FFPROBE_CACHE: Dict[Tuple[str, str], Any] = {}


def clear_cache():
    """Clear the ffprobe cache.

    This can be useful when media files have been modified and you need
    to re-query their properties.
    """
    global _FFPROBE_CACHE
    _FFPROBE_CACHE.clear()


def verify_ffprobe_installed() -> bool:
    """Check if ffprobe is available in the system.

    Returns:
        bool: True if ffprobe is available, False otherwise.
    """
    try:
        subprocess.run(
            ["ffprobe", "-version"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False
        )
        return True
    except (OSError, FileNotFoundError):
        return False


def _run_ffprobe_command(args: list, check_installed: bool = True) -> Tuple[bytes, bytes]:
    """Run ffprobe with the given arguments.

    Args:
        args: List of command-line arguments for ffprobe
        check_installed: If True, verify ffprobe is installed first

    Returns:
        Tuple of (stdout, stderr) as bytes

    Raises:
        FFProbeNotFoundError: If ffprobe is not found
        FFProbeCommandError: If ffprobe command fails
    """
    if check_installed and not verify_ffprobe_installed():
        raise FFProbeNotFoundError(
            "ffprobe not found. Please install ffmpeg from https://www.ffmpeg.org"
        )

    try:
        proc = subprocess.Popen(
            ["ffprobe"] + args,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        out, err = proc.communicate()

        if proc.returncode != 0:
            raise FFProbeCommandError(
                f"ffprobe command failed with return code {proc.returncode}: "
                f"{err.decode('utf-8', errors='replace')}"
            )

        return out, err
    except OSError as e:
        raise FFProbeNotFoundError(f"Failed to execute ffprobe: {e}")


def get_media_info(filepath: str, use_cache: bool = True) -> Dict[str, Any]:
    """Get complete media information using ffprobe.

    This returns the full JSON output from ffprobe, including all streams
    and format information.

    Args:
        filepath: Path to the media file
        use_cache: If True, use cached results if available

    Returns:
        Dictionary containing the parsed JSON output from ffprobe

    Raises:
        FFProbeNotFoundError: If ffprobe is not found
        FFProbeCommandError: If ffprobe command fails
        FileNotFoundError: If the media file doesn't exist
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Media file not found: {filepath}")

    # Use absolute path for cache key consistency
    abs_path = os.path.abspath(filepath)
    cache_key = (abs_path, "media_info")

    if use_cache and cache_key in _FFPROBE_CACHE:
        return _FFPROBE_CACHE[cache_key]

    args = [
        "-v", "quiet",
        "-print_format", "json",
        "-show_format",
        "-show_streams",
        abs_path
    ]

    out, _ = _run_ffprobe_command(args)
    result = json.loads(out.decode('utf-8'))

    if use_cache:
        _FFPROBE_CACHE[cache_key] = result

    return result


def _get_video_stream(media_info: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Extract the first video stream from media info (internal helper).

    Args:
        media_info: Media info dictionary from get_media_info()

    Returns:
        Video stream dictionary or None if no video stream found
    """
    streams = media_info.get("streams", [])
    for stream in streams:
        if stream.get("codec_type") == "video":
            return stream
    return None


def _get_audio_stream(media_info: Dict[str, Any], index: int = 0) -> Optional[Dict[str, Any]]:
    """Extract an audio stream from media info (internal helper).

    Args:
        media_info: Media info dictionary from get_media_info()
        index: Which audio stream to return (default: 0 for first)

    Returns:
        Audio stream dictionary or None if no audio stream found
    """
    streams = media_info.get("streams", [])
    audio_streams = [s for s in streams if s.get("codec_type") == "audio"]
    if index < len(audio_streams):
        return audio_streams[index]
    return None


def get_duration(filepath: str, use_cache: bool = True) -> Optional[float]:
    """Get the duration of a media file in seconds.

    Calculates duration from:
    - Video: number of frames / frame rate
    - Audio: number of samples / sample rate (if no video)

    Args:
        filepath: Path to the media file
        use_cache: If True, use cached results if available

    Returns:
        Duration in seconds as a float, or None if not available

    Raises:
        FFProbeNotFoundError: If ffprobe is not found
        FFProbeCommandError: If ffprobe command fails
        FileNotFoundError: If the media file doesn't exist
    """
    media_info = get_media_info(filepath, use_cache=use_cache)

    # Try video first: nb_frames / frame_rate
    video_stream = _get_video_stream(media_info)
    if video_stream:
        # Get number of frames
        nb_frames_str = video_stream.get("nb_frames")
        if nb_frames_str:
            try:
                nb_frames = int(nb_frames_str)

                # Get frame rate
                r_frame_rate = video_stream.get("r_frame_rate", "")
                if r_frame_rate and "/" in r_frame_rate:
                    num, denom = r_frame_rate.split("/")
                    fps = float(num) / float(denom)
                    if fps > 0:
                        return nb_frames / fps
            except (ValueError, ZeroDivisionError, TypeError):
                pass

        # Fallback: use duration_ts and time_base for video
        duration_ts = video_stream.get("duration_ts")
        time_base = video_stream.get("time_base", "")
        if duration_ts and time_base and "/" in time_base:
            try:
                num, denom = time_base.split("/")
                time_base_float = float(num) / float(denom)
                return int(duration_ts) * time_base_float
            except (ValueError, ZeroDivisionError, TypeError):
                pass

    # Fall back to audio: nb_samples / sample_rate (or duration_ts * time_base)
    audio_stream = _get_audio_stream(media_info)
    if audio_stream:
        # Try duration_ts and time_base first (most reliable for audio)
        duration_ts = audio_stream.get("duration_ts")
        time_base = audio_stream.get("time_base", "")
        if duration_ts and time_base and "/" in time_base:
            try:
                num, denom = time_base.split("/")
                time_base_float = float(num) / float(denom)
                return int(duration_ts) * time_base_float
            except (ValueError, ZeroDivisionError, TypeError):
                pass

        # Alternative: calculate from sample count if available
        duration_str = audio_stream.get("duration")
        if duration_str:
            try:
                return float(duration_str)
            except (ValueError, TypeError):
                pass

    # Last resort: try format duration
    format_info = media_info.get("format", {})
    duration_str = format_info.get("duration")
    if duration_str:
        try:
            return float(duration_str)
        except (ValueError, TypeError):
            pass

    return None


def get_width(filepath: str, use_cache: bool = True) -> Optional[int]:
    """Get the width of a video file in pixels.

    Args:
        filepath: Path to the media file
        use_cache: If True, use cached results if available

    Returns:
        Width in pixels as an integer, or None if not available

    Raises:
        FFProbeNotFoundError: If ffprobe is not found
        FFProbeCommandError: If ffprobe command fails
        FileNotFoundError: If the media file doesn't exist
    """
    media_info = get_media_info(filepath, use_cache=use_cache)
    video_stream = _get_video_stream(media_info)

    if not video_stream:
        return None

    width = video_stream.get("width")
    if width is not None:
        try:
            return int(width)
        except (ValueError, TypeError):
            pass

    return None


def get_height(filepath: str, use_cache: bool = True) -> Optional[int]:
    """Get the height of a video file in pixels.

    Args:
        filepath: Path to the media file
        use_cache: If True, use cached results if available

    Returns:
        Height in pixels as an integer, or None if not available

    Raises:
        FFProbeNotFoundError: If ffprobe is not found
        FFProbeCommandError: If ffprobe command fails
        FileNotFoundError: If the media file doesn't exist
    """
    media_info = get_media_info(filepath, use_cache=use_cache)
    video_stream = _get_video_stream(media_info)

    if not video_stream:
        return None

    height = video_stream.get("height")
    if height is not None:
        try:
            return int(height)
        except (ValueError, TypeError):
            pass

    return None


def get_framerate(filepath: str, use_cache: bool = True) -> Optional[float]:
    """Get the framerate of a video file.

    Args:
        filepath: Path to the media file
        use_cache: If True, use cached results if available

    Returns:
        Framerate as a float (e.g., 24.0, 29.97), or None if not available

    Raises:
        FFProbeNotFoundError: If ffprobe is not found
        FFProbeCommandError: If ffprobe command fails
        FileNotFoundError: If the media file doesn't exist
    """
    media_info = get_media_info(filepath, use_cache=use_cache)
    video_stream = _get_video_stream(media_info)

    if not video_stream:
        return None

    # Try r_frame_rate first (most common)
    r_frame_rate = video_stream.get("r_frame_rate", "")
    if r_frame_rate and "/" in r_frame_rate:
        try:
            num, denom = r_frame_rate.split("/")
            fps = float(num) / float(denom)
            if fps > 0:
                return fps
        except (ValueError, ZeroDivisionError):
            pass

    # Fall back to avg_frame_rate
    avg_frame_rate = video_stream.get("avg_frame_rate", "")
    if avg_frame_rate and "/" in avg_frame_rate:
        try:
            num, denom = avg_frame_rate.split("/")
            fps = float(num) / float(denom)
            if fps > 0:
                return fps
        except (ValueError, ZeroDivisionError):
            pass

    return None


def get_samplerate(filepath: str, use_cache: bool = True) -> Optional[int]:
    """Get the audio sample rate of a media file.

    Args:
        filepath: Path to the media file
        use_cache: If True, use cached results if available

    Returns:
        Sample rate in Hz as an integer (e.g., 48000, 44100), or None if not available

    Raises:
        FFProbeNotFoundError: If ffprobe is not found
        FFProbeCommandError: If ffprobe command fails
        FileNotFoundError: If the media file doesn't exist
    """
    media_info = get_media_info(filepath, use_cache=use_cache)
    audio_stream = _get_audio_stream(media_info)

    if not audio_stream:
        return None

    sample_rate = audio_stream.get("sample_rate")
    if sample_rate is not None:
        try:
            return int(sample_rate)
        except (ValueError, TypeError):
            pass

    return None


def get_channels(filepath: str, use_cache: bool = True) -> Optional[int]:
    """Get the number of audio channels in a media file.

    Args:
        filepath: Path to the media file
        use_cache: If True, use cached results if available

    Returns:
        Number of audio channels as an integer (e.g., 1, 2, 6), or None if not available

    Raises:
        FFProbeNotFoundError: If ffprobe is not found
        FFProbeCommandError: If ffprobe command fails
        FileNotFoundError: If the media file doesn't exist
    """
    media_info = get_media_info(filepath, use_cache=use_cache)
    audio_stream = _get_audio_stream(media_info)

    if not audio_stream:
        return None

    channels = audio_stream.get("channels")
    if channels is not None:
        try:
            return int(channels)
        except (ValueError, TypeError):
            pass

    return None



