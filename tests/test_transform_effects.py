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

    def test_eq(self):
        scale1 = otio.schema.VideoScale(
            name="ScaleIt",
            width=Fraction(1, 2),
            height=Fraction(2, 1),
            metadata={
                "foo": "bar"
            }
        )
        scale2 = otio.schema.VideoScale(
            name="ScaleIt",
            width=Fraction(1, 2),
            height=Fraction(2, 1),
            metadata={
                "foo": "bar"
            }
        )
        self.assertIsOTIOEquivalentTo(scale1, scale2)

    def test_serialize(self):
        scale = otio.schema.VideoScale(
            name="ScaleIt",
            width=Fraction(1, 2),
            height=Fraction(2, 1),
            metadata={
                "foo": "bar"
            }
        )
        encoded = otio.adapters.otio_json.write_to_string(scale)
        decoded = otio.adapters.otio_json.read_from_string(encoded)
        self.assertIsOTIOEquivalentTo(scale, decoded)

    def test_setters(self):
        scale = otio.schema.VideoScale(
            name="ScaleIt",
            width=Fraction(1, 2),
            height=Fraction(2, 1),
            metadata={
                "foo": "bar"
            }
        )
        self.assertEqual(scale.width, Fraction(1, 2))
        scale.width = 0.25
        self.assertEqual(scale.width, Fraction(1, 4))

class VideoCropTests(unittest.TestCase, otio_test_utils.OTIOAssertions):
    def test_cons(self):
        crop = otio.schema.VideoCrop(
            name="CropIt",
            left=Fraction(1, 10),
            right=Fraction(2, 10),
            top=Fraction(3, 10),
            bottom=Fraction(4, 10),
            metadata={
                "baz": "qux"
            }
        )
        self.assertEqual(crop.left, Fraction(1, 10))
        self.assertEqual(crop.right, Fraction(2, 10))
        self.assertEqual(crop.top, Fraction(3, 10))
        self.assertEqual(crop.bottom, Fraction(4, 10))
        self.assertEqual(crop.name, "CropIt")
        self.assertEqual(crop.metadata, {"baz": "qux"})

    def test_eq(self):
        crop1 = otio.schema.VideoCrop(
            name="CropIt",
            left=Fraction(1, 10),
            right=Fraction(2, 10),
            top=Fraction(3, 10),
            bottom=Fraction(4, 10),
            metadata={
                "baz": "qux"
            }
        )
        crop2 = otio.schema.VideoCrop(
            name="CropIt",
            left=Fraction(1, 10),
            right=Fraction(2, 10),
            top=Fraction(3, 10),
            bottom=Fraction(4, 10),
            metadata={
                "baz": "qux"
            }
        )
        self.assertIsOTIOEquivalentTo(crop1, crop2)

    def test_serialize(self):
        crop = otio.schema.VideoCrop(
            name="CropIt",
            left=Fraction(1, 10),
            right=Fraction(2, 10),
            top=Fraction(3, 10),
            bottom=Fraction(4, 10),
            metadata={
                "baz": "qux"
            }
        )
        encoded = otio.adapters.otio_json.write_to_string(crop)
        decoded = otio.adapters.otio_json.read_from_string(encoded)
        self.assertIsOTIOEquivalentTo(crop, decoded)

    def test_setters(self):
        crop = otio.schema.VideoCrop(
            name="CropIt",
            left=Fraction(1, 10),
            right=Fraction(2, 10),
            top=Fraction(3, 10),
            bottom=Fraction(4, 10),
            metadata={
                "baz": "qux"
            }
        )
        self.assertEqual(crop.left, Fraction(1, 10))
        crop.left = 0.2
        self.assertEqual(crop.left, Fraction(1, 5))
        crop.right = 0.3
        self.assertEqual(crop.right, Fraction(3, 10))
        crop.top = 0.4
        self.assertEqual(crop.top, Fraction(2, 5))
        crop.bottom = 0.5
        self.assertEqual(crop.bottom, Fraction(1, 2))

class VideoPositionTests(unittest.TestCase, otio_test_utils.OTIOAssertions):
    def test_constructor(self):
        position = otio.schema.VideoPosition(
            name="PositionIt",
            x=Fraction(3, 4),
            y=Fraction(5, 6),
            metadata={
                "alpha": "beta"
            }
        )
        self.assertEqual(position.x, Fraction(3, 4))
        self.assertEqual(position.y, Fraction(5, 6))
        self.assertEqual(position.name, "PositionIt")
        self.assertEqual(position.metadata, {"alpha": "beta"})

    def test_eq(self):
        pos1 = otio.schema.VideoPosition(
            name="PositionIt",
            x=Fraction(3, 4),
            y=Fraction(5, 6),
            metadata={
                "alpha": "beta"
            }
        )
        pos2 = otio.schema.VideoPosition(
            name="PositionIt",
            x=Fraction(3, 4),
            y=Fraction(5, 6),
            metadata={
                "alpha": "beta"
            }
        )
        self.assertIsOTIOEquivalentTo(pos1, pos2)

    def test_serialize(self):
        position = otio.schema.VideoPosition(
            name="PositionIt",
            x=Fraction(3, 4),
            y=Fraction(5, 6),
            metadata={
                "alpha": "beta"
            }
        )
        encoded = otio.adapters.otio_json.write_to_string(position)
        decoded = otio.adapters.otio_json.read_from_string(encoded)
        self.assertIsOTIOEquivalentTo(position, decoded)

    def test_setters(self):
        position = otio.schema.VideoPosition(
            name="PositionIt",
            x=Fraction(3, 4),
            y=Fraction(5, 6),
            metadata={
                "alpha": "beta"
            }
        )
        self.assertEqual(position.x, Fraction(3, 4))
        position.x = 0.25
        self.assertEqual(position.x, Fraction(1, 4))
        position.y = 0.5
        self.assertEqual(position.y, Fraction(1, 2))

class VideoRotateTests(unittest.TestCase, otio_test_utils.OTIOAssertions):
    def test_constructor(self):
        rotate = otio.schema.VideoRotate(
            name="RotateIt",
            rotation=Fraction(90, 360),
            metadata={
                "rot": "val"
            }
        )
        self.assertEqual(rotate.rotation, Fraction(90, 360))
        self.assertEqual(rotate.name, "RotateIt")
        self.assertEqual(rotate.metadata, {"rot": "val"})

    def test_eq(self):
        rot1 = otio.schema.VideoRotate(
            name="RotateIt",
            rotation=Fraction(90, 360),
            metadata={
                "rot": "val"
            }
        )
        rot2 = otio.schema.VideoRotate(
            name="RotateIt",
            rotation=Fraction(90, 360),
            metadata={
                "rot": "val"
            }
        )
        self.assertIsOTIOEquivalentTo(rot1, rot2)

    def test_serialize(self):
        rotate = otio.schema.VideoRotate(
            name="RotateIt",
            rotation=Fraction(90, 360),
            metadata={
                "rot": "val"
            }
        )
        encoded = otio.adapters.otio_json.write_to_string(rotate)
        decoded = otio.adapters.otio_json.read_from_string(encoded)
        self.assertIsOTIOEquivalentTo(rotate, decoded)

    def test_setters(self):
        rotate = otio.schema.VideoRotate(
            name="RotateIt",
            rotation=Fraction(90, 360),
            metadata={
                "rot": "val"
            }
        )
        self.assertEqual(rotate.rotation, Fraction(90, 360))
        rotate.rotation = Fraction(45, 360)
        self.assertEqual(rotate.rotation, Fraction(45, 360))
        rotate.rotation = Fraction(22, 360)
        self.assertEqual(rotate.rotation, Fraction(22, 360))
