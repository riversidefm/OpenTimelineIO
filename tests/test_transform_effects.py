"""Transform effects class test harness."""

import unittest
from fractions import Fraction

import opentimelineio as otio
import opentimelineio.test_utils as otio_test_utils


class VideoScaleTests(unittest.TestCase, otio_test_utils.OTIOAssertions):
    def test_constructor(self):
        scale = otio.schema.VideoScale(
            name="ScaleIt",
            width=Fraction(1, 2),
            height=Fraction(2, 1),
            metadata={
                "foo": "bar"
            }
        )
        self.assertEqual(scale.width, Fraction(1, 2))
        self.assertEqual(scale.height, Fraction(2, 1))
        self.assertEqual(scale.name, "ScaleIt")
        self.assertEqual(scale.metadata, {"foo": "bar"})
