#include "utils.h"
#include <opentimelineio/clip.h>
#include <opentimelineio/track.h>
#include <opentimelineio/serializableObject.h>

namespace otime = opentime::OPENTIME_VERSION;
namespace otio  = opentimelineio::OPENTIMELINEIO_VERSION;

int
main(int argc, char** argv)
{
    Tests tests;
    tests.add_test("test_schema_retainer_cast", [] {
        otio::SerializableObject::Retainer<otio::SerializableObject> clip(new otio::Clip);

        otio::SerializableObject::Retainer<otio::Clip> clip2 = otio::schema_retainer_cast<otio::Clip>(clip);
        assertTrue(clip2);
        otio::SerializableObject::Retainer<otio::Track> track = otio::dynamic_retainer_cast<otio::Track>(clip);
        assertFalse(track);
    });
    tests.run(argc, argv);
}
