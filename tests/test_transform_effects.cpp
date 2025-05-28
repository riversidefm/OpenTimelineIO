#include "utils.h"

#include <opentimelineio/clip.h>
#include <opentimelineio/deserialization.h>
#include <opentimelineio/externalReference.h>
#include <opentimelineio/transformEffects.h>

namespace otime = opentime::OPENTIME_VERSION;
namespace otio  = opentimelineio::OPENTIMELINEIO_VERSION;

int
main(int argc, char** argv)
{
    Tests tests;
    tests.add_test("test_video_transform_read", [] {
        using namespace otio;

        otio::ErrorStatus              status;
        SerializableObject::Retainer<> so =
            SerializableObject::from_json_string(
                R"(
            {
                "OTIO_SCHEMA": "Clip.1",
                "media_reference": {
                    "OTIO_SCHEMA": "ExternalReference.1",
                    "target_url": "unit_test_url",
                    "available_range": {
                        "OTIO_SCHEMA": "TimeRange.1",
                        "duration": {
                            "OTIO_SCHEMA": "RationalTime.1",
                            "rate": 24,
                            "value": 8
                        },
                        "start_time": {
                            "OTIO_SCHEMA": "RationalTime.1",
                            "rate": 24,
                            "value": 10
                        }
                    }
                },
                "effects": [
                    {
                        "OTIO_SCHEMA": "VideoScale.1",
                        "name": "scale",
                        "width": "1/2",
                        "height": "1/2",
                        "effect_name": "VideoScale",
                        "enabled": true
                    },
                    {
                        "OTIO_SCHEMA": "VideoPosition.1",
                        "name": "position",
                        "x": "-1/2",
                        "y": "-1/2",
                        "effect_name": "VideoPosition",
                        "enabled": true
                    },
                    {
                        "OTIO_SCHEMA": "VideoRotate.1",
                        "name": "rotate",
                        "rotation": "90/360",
                        "effect_name": "VideoRotate",
                        "enabled": true
                    },
                    {
                        "OTIO_SCHEMA": "VideoCrop.1",
                        "name": "crop",
                        "left": "-1/4",
                        "right": "1/4",
                        "top": "-1/4",
                        "bottom": "1/4",
                        "effect_name": "VideoCrop",
                        "enabled": true
                    }
                ]
            })",
                &status);

        assertFalse(is_error(status));

        const Clip* clip = dynamic_cast<const Clip*>(so.value);
        assertNotNull(clip);

        auto effects = clip->effects();
        assertEqual(effects.size(), 4);

        auto video_scale = dynamic_cast<const VideoScale*>(effects[0].value);
        assertNotNull(video_scale);
        assertEqual(video_scale->width(), Rational(1, 2));
        assertEqual(video_scale->height(), Rational(1, 2));

        auto video_position = dynamic_cast<const VideoPosition*>(effects[1].value);
        assertNotNull(video_position);
        assertEqual(video_position->x(), Rational(-1, 2));
        assertEqual(video_position->y(), Rational(-1, 2));

        auto video_rotate = dynamic_cast<const VideoRotate*>(effects[2].value);
        assertNotNull(video_rotate);
        assertEqual(video_rotate->rotation(), Rational(90, 360));

        auto video_crop = dynamic_cast<const VideoCrop*>(effects[3].value);
        assertNotNull(video_crop);
        assertEqual(video_crop->left(), Rational(-1, 4));
        assertEqual(video_crop->right(), Rational(1, 4));
        assertEqual(video_crop->top(), Rational(-1, 4));
        assertEqual(video_crop->bottom(), Rational(1, 4));
    });

    tests.add_test("test_video_transform_write", [] {
        using namespace otio;

        SerializableObject::Retainer<otio::Clip> clip(new otio::Clip(
            "unit_clip",
            new otio::ExternalReference("unit_test_url"),
            std::nullopt,
            otio::AnyDictionary(),
            { new otio::VideoScale("scale", otime::Rational(1, 2), otime::Rational(1, 2)),
              new otio::VideoPosition("position", otime::Rational(-1, 2), otime::Rational(-1, 2)),
              new otio::VideoRotate("rotate", otime::Rational(90, 360)),
              new otio::VideoCrop("crop", otime::Rational(-1, 4), otime::Rational(1, 4), otime::Rational(-1, 4), otime::Rational(1, 4)) }));

        auto json = clip.value->to_json_string();

        std::string expected_json = R"({
    "OTIO_SCHEMA": "Clip.2",
    "metadata": {},
    "name": "unit_clip",
    "source_range": null,
    "effects": [
        {
            "OTIO_SCHEMA": "VideoScale.1",
            "metadata": {},
            "name": "scale",
            "effect_name": "VideoScale",
            "enabled": true,
            "width": "1/2",
            "height": "1/2"
        },
        {
            "OTIO_SCHEMA": "VideoPosition.1",
            "metadata": {},
            "name": "position",
            "effect_name": "VideoPosition",
            "enabled": true,
            "x": "-1/2",
            "y": "-1/2"
        },
        {
            "OTIO_SCHEMA": "VideoRotate.1",
            "metadata": {},
            "name": "rotate",
            "effect_name": "VideoRotate",
            "enabled": true,
            "rotation": "1/4"
        },
        {
            "OTIO_SCHEMA": "VideoCrop.1",
            "metadata": {},
            "name": "crop",
            "effect_name": "VideoCrop",
            "enabled": true,
            "left": "-1/4",
            "right": "1/4",
            "top": "-1/4",
            "bottom": "1/4"
        }
    ],
    "markers": [],
    "enabled": true,
    "media_references": {
        "DEFAULT_MEDIA": {
            "OTIO_SCHEMA": "ExternalReference.1",
            "metadata": {},
            "name": "",
            "available_range": null,
            "available_image_bounds": null,
            "target_url": "unit_test_url"
        }
    },
    "active_media_reference_key": "DEFAULT_MEDIA"
})";

        assertEqual(json, expected_json);

    });

    tests.run(argc, argv);
    return 0;
}
