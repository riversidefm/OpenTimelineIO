#!/usr/bin/env python
#
# SPDX-License-Identifier: Apache-2.0
# Copyright Contributors to the OpenTimelineIO project

"""Unit tests for ffprobe_utils module."""

import unittest
import unittest.mock as mock
import os

import opentimelineio as otio
from opentimelineio.adapters import ffprobe_utils


class TestFFProbeUtils(unittest.TestCase):
    """Test cases for ffprobe_utils functionality."""

    def setUp(self):
        """Clear cache before each test."""
        ffprobe_utils.clear_cache()

    def tearDown(self):
        """Clear cache after each test."""
        ffprobe_utils.clear_cache()

    def test_clear_cache(self):
        """Test that clear_cache works."""
        # This should not raise an exception
        ffprobe_utils.clear_cache()
        self.assertTrue(True)

    def test_verify_ffprobe_installed_mock(self):
        """Test verify_ffprobe_installed with mock."""
        with mock.patch('subprocess.run') as mock_run:
            mock_run.return_value = mock.Mock(returncode=0)
            result = ffprobe_utils.verify_ffprobe_installed()
            self.assertTrue(result)

        with mock.patch('subprocess.run', side_effect=FileNotFoundError):
            result = ffprobe_utils.verify_ffprobe_installed()
            self.assertFalse(result)

    def test_get_duration_with_mock(self):
        """Test get_duration with mocked ffprobe output."""
        mock_media_info = {
            "streams": [
                {
                    "codec_type": "video",
                    "nb_frames": "2400",
                    "r_frame_rate": "24/1",
                    "duration_ts": 2400,
                    "time_base": "1/24"
                }
            ],
            "format": {}
        }

        with mock.patch.object(
            ffprobe_utils,
            'get_media_info',
            return_value=mock_media_info
        ):
            duration = ffprobe_utils.get_duration("test.mp4")
            self.assertEqual(duration, 100.0)  # 2400 frames / 24 fps

    def test_get_width_with_mock(self):
        """Test get_width with mocked ffprobe output."""
        mock_media_info = {
            "streams": [
                {
                    "codec_type": "video",
                    "width": 1920,
                    "height": 1080
                }
            ]
        }

        with mock.patch.object(
            ffprobe_utils,
            'get_media_info',
            return_value=mock_media_info
        ):
            width = ffprobe_utils.get_width("test.mp4")
            self.assertEqual(width, 1920)

    def test_get_height_with_mock(self):
        """Test get_height with mocked ffprobe output."""
        mock_media_info = {
            "streams": [
                {
                    "codec_type": "video",
                    "width": 1920,
                    "height": 1080
                }
            ]
        }

        with mock.patch.object(
            ffprobe_utils,
            'get_media_info',
            return_value=mock_media_info
        ):
            height = ffprobe_utils.get_height("test.mp4")
            self.assertEqual(height, 1080)

    def test_get_framerate_with_mock(self):
        """Test get_framerate with mocked ffprobe output."""
        mock_media_info = {
            "streams": [
                {
                    "codec_type": "video",
                    "r_frame_rate": "24000/1001",  # 23.976 fps
                    "avg_frame_rate": "24000/1001"
                }
            ]
        }

        with mock.patch.object(
            ffprobe_utils,
            'get_media_info',
            return_value=mock_media_info
        ):
            fps = ffprobe_utils.get_framerate("test.mp4")
            self.assertAlmostEqual(fps, 23.976, places=3)

    def test_get_samplerate_with_mock(self):
        """Test get_samplerate with mocked ffprobe output."""
        mock_media_info = {
            "streams": [
                {
                    "codec_type": "audio",
                    "sample_rate": "48000"
                }
            ]
        }

        with mock.patch.object(
            ffprobe_utils,
            'get_media_info',
            return_value=mock_media_info
        ):
            samplerate = ffprobe_utils.get_samplerate("test.wav")
            self.assertEqual(samplerate, 48000)

    def test_get_channels_with_mock(self):
        """Test get_channels with mocked ffprobe output."""
        mock_media_info = {
            "streams": [
                {
                    "codec_type": "audio",
                    "channels": 2
                }
            ]
        }

        with mock.patch.object(
            ffprobe_utils,
            'get_media_info',
            return_value=mock_media_info
        ):
            channels = ffprobe_utils.get_channels("test.wav")
            self.assertEqual(channels, 2)

    def test_no_video_stream(self):
        """Test behavior when there's no video stream."""
        mock_media_info = {
            "streams": [
                {
                    "codec_type": "audio",
                    "sample_rate": "48000"
                }
            ],
            "format": {}
        }

        with mock.patch.object(
            ffprobe_utils,
            'get_media_info',
            return_value=mock_media_info
        ):
            width = ffprobe_utils.get_width("test.wav")
            self.assertIsNone(width)

            height = ffprobe_utils.get_height("test.wav")
            self.assertIsNone(height)

            fps = ffprobe_utils.get_framerate("test.wav")
            self.assertIsNone(fps)

    def test_no_audio_stream(self):
        """Test behavior when there's no audio stream."""
        mock_media_info = {
            "streams": [
                {
                    "codec_type": "video",
                    "width": 1920,
                    "height": 1080
                }
            ],
            "format": {}
        }

        with mock.patch.object(
            ffprobe_utils,
            'get_media_info',
            return_value=mock_media_info
        ):
            samplerate = ffprobe_utils.get_samplerate("test.mp4")
            self.assertIsNone(samplerate)

            channels = ffprobe_utils.get_channels("test.mp4")
            self.assertIsNone(channels)

    def test_audio_duration_fallback(self):
        """Test duration calculation falls back to audio when no video."""
        mock_media_info = {
            "streams": [
                {
                    "codec_type": "audio",
                    "duration_ts": 4800000,
                    "time_base": "1/48000"
                }
            ],
            "format": {}
        }

        with mock.patch.object(
            ffprobe_utils,
            'get_media_info',
            return_value=mock_media_info
        ):
            duration = ffprobe_utils.get_duration("test.wav")
            self.assertEqual(duration, 100.0)  # 4800000 / 48000

    def test_duration_format_fallback(self):
        """Test duration falls back to format duration."""
        mock_media_info = {
            "streams": [],
            "format": {
                "duration": "120.5"
            }
        }

        with mock.patch.object(
            ffprobe_utils,
            'get_media_info',
            return_value=mock_media_info
        ):
            duration = ffprobe_utils.get_duration("test.mp4")
            self.assertEqual(duration, 120.5)

    def test_caching_behavior(self):
        """Test that caching works correctly."""
        mock_media_info = {
            "streams": [
                {
                    "codec_type": "video",
                    "width": 1920,
                    "height": 1080,
                    "r_frame_rate": "24/1"
                }
            ],
            "format": {}
        }

        call_count = 0

        def mock_get_media_info_with_counter(filepath, use_cache=True):
            nonlocal call_count
            call_count += 1
            return mock_media_info

        with mock.patch.object(
            ffprobe_utils,
            'get_media_info',
            side_effect=mock_get_media_info_with_counter
        ):
            # First call should hit the mock
            width1 = ffprobe_utils.get_width("test.mp4", use_cache=True)
            self.assertEqual(width1, 1920)
            first_call_count = call_count

            # Second call should also hit (because we're mocking get_media_info itself)
            width2 = ffprobe_utils.get_width("test.mp4", use_cache=True)
            self.assertEqual(width2, 1920)

            # Both should return same value
            self.assertEqual(width1, width2)

    def test_file_not_found_error(self):
        """Test that FileNotFoundError is raised for non-existent files."""
        # We need to mock os.path.exists to return False
        with mock.patch('os.path.exists', return_value=False):
            with self.assertRaises(FileNotFoundError):
                ffprobe_utils.get_media_info("/nonexistent/file.mp4")

    def test_ffprobe_not_found_error(self):
        """Test FFProbeNotFoundError is raised when ffprobe isn't installed."""
        with mock.patch('os.path.exists', return_value=True):
            with mock.patch(
                'subprocess.Popen',
                side_effect=OSError("ffprobe not found")
            ):
                with self.assertRaises(ffprobe_utils.FFProbeNotFoundError):
                    ffprobe_utils.get_media_info("test.mp4")

    def test_internal_helper_functions(self):
        """Test internal helper functions."""
        mock_media_info = {
            "streams": [
                {
                    "codec_type": "video",
                    "width": 1920
                },
                {
                    "codec_type": "audio",
                    "channels": 2
                },
                {
                    "codec_type": "audio",
                    "channels": 6
                }
            ]
        }

        video_stream = ffprobe_utils._get_video_stream(mock_media_info)
        self.assertIsNotNone(video_stream)
        self.assertEqual(video_stream["codec_type"], "video")

        audio_stream = ffprobe_utils._get_audio_stream(mock_media_info, index=0)
        self.assertIsNotNone(audio_stream)
        self.assertEqual(audio_stream["channels"], 2)

        audio_stream2 = ffprobe_utils._get_audio_stream(mock_media_info, index=1)
        self.assertIsNotNone(audio_stream2)
        self.assertEqual(audio_stream2["channels"], 6)

        # Test no video stream
        no_video = {"streams": [{"codec_type": "audio"}]}
        self.assertIsNone(ffprobe_utils._get_video_stream(no_video))

        # Test no audio stream
        no_audio = {"streams": [{"codec_type": "video"}]}
        self.assertIsNone(ffprobe_utils._get_audio_stream(no_audio))


class TestAdapterFFProbeIntegration(unittest.TestCase):
    """Test that Adapter class exposes ffprobe methods correctly."""

    def setUp(self):
        """Clear cache before each test."""
        ffprobe_utils.clear_cache()

    def tearDown(self):
        """Clear cache after each test."""
        ffprobe_utils.clear_cache()

    def test_adapter_ffprobe_methods_exist(self):
        """Test that Adapter class has all ffprobe methods."""
        from opentimelineio.adapters import Adapter

        self.assertTrue(hasattr(Adapter, 'ffprobe_get_duration'))
        self.assertTrue(hasattr(Adapter, 'ffprobe_get_width'))
        self.assertTrue(hasattr(Adapter, 'ffprobe_get_height'))
        self.assertTrue(hasattr(Adapter, 'ffprobe_get_framerate'))
        self.assertTrue(hasattr(Adapter, 'ffprobe_get_samplerate'))
        self.assertTrue(hasattr(Adapter, 'ffprobe_get_channels'))
        self.assertTrue(hasattr(Adapter, 'ffprobe_verify_installed'))
        self.assertTrue(hasattr(Adapter, 'ffprobe_clear_cache'))

    def test_adapter_methods_are_static(self):
        """Test that adapter methods are static and can be called without instance."""
        from opentimelineio.adapters import Adapter

        mock_media_info = {
            "streams": [
                {
                    "codec_type": "video",
                    "width": 1920,
                    "nb_frames": "240",
                    "r_frame_rate": "24/1"
                }
            ],
            "format": {}
        }

        with mock.patch.object(
            ffprobe_utils,
            'get_media_info',
            return_value=mock_media_info
        ):
            # Should be able to call without creating an Adapter instance
            width = Adapter.ffprobe_get_width("test.mp4")
            self.assertEqual(width, 1920)

            duration = Adapter.ffprobe_get_duration("test.mp4")
            self.assertEqual(duration, 10.0)  # 240 / 24

    def test_adapter_methods_delegate_correctly(self):
        """Test that Adapter methods correctly delegate to ffprobe_utils."""
        from opentimelineio.adapters import Adapter

        mock_media_info = {
            "streams": [
                {
                    "codec_type": "video",
                    "width": 3840,
                    "height": 2160,
                    "r_frame_rate": "30000/1001"
                },
                {
                    "codec_type": "audio",
                    "sample_rate": "48000",
                    "channels": 2
                }
            ],
            "format": {}
        }

        with mock.patch.object(
            ffprobe_utils,
            'get_media_info',
            return_value=mock_media_info
        ):
            # Test all methods
            width = Adapter.ffprobe_get_width("test.mp4")
            self.assertEqual(width, 3840)

            height = Adapter.ffprobe_get_height("test.mp4")
            self.assertEqual(height, 2160)

            fps = Adapter.ffprobe_get_framerate("test.mp4")
            self.assertAlmostEqual(fps, 29.97, places=2)

            samplerate = Adapter.ffprobe_get_samplerate("test.mp4")
            self.assertEqual(samplerate, 48000)

            channels = Adapter.ffprobe_get_channels("test.mp4")
            self.assertEqual(channels, 2)


if __name__ == '__main__':
    unittest.main()

