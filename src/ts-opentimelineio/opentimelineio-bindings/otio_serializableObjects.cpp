// SPDX-License-Identifier: Apache-2.0
// Copyright Contributors to the OpenTimelineIO project

#ifdef EMSCRIPTEN
#include <emscripten/bind.h>
#endif

#include "opentimelineio/clip.h"
#include "opentimelineio/timeline.h"
#include "opentimelineio/track.h"
#include "opentimelineio/stack.h"
#include "opentimelineio/gap.h"
#include "opentimelineio/marker.h"
#include "opentimelineio/mediaReference.h"
#include "opentimelineio/externalReference.h"
#include "opentimelineio/serializableObject.h"

using namespace opentimelineio;

void otio_serializable_object_bindings() {
#ifdef EMSCRIPTEN
    using namespace emscripten;
    
    // Base SerializableObject
    class_<SerializableObject>("SerializableObject")
        .function("schema_name", &SerializableObject::schema_name)
        .function("schema_version", &SerializableObject::schema_version)
        .function("to_json_string", select_overload<std::string(ErrorStatus*, schema_version_map const*, int) const>(&SerializableObject::to_json_string), allow_raw_pointers())
        ;
        
    // SerializableObjectWithMetadata
    class_<SerializableObjectWithMetadata, emscripten::base<SerializableObject>>("SerializableObjectWithMetadata")
        .function("name", &SerializableObjectWithMetadata::name)
        .function("set_name", &SerializableObjectWithMetadata::set_name)
        ;
        
    // Marker
    class_<Marker, emscripten::base<SerializableObjectWithMetadata>>("Marker")
        .constructor<std::string, TimeRange, std::string>()
        .function("color", &Marker::color)
        .function("set_color", &Marker::set_color)
        .function("marked_range", &Marker::marked_range)
        .function("set_marked_range", &Marker::set_marked_range)
        ;
        
    // MediaReference
    class_<MediaReference, emscripten::base<SerializableObjectWithMetadata>>("MediaReference")
        .function("is_missing_reference", &MediaReference::is_missing_reference)
        ;
        
    // ExternalReference
    class_<ExternalReference, emscripten::base<MediaReference>>("ExternalReference")
        .constructor<std::string>()
        .function("target_url", &ExternalReference::target_url)
        .function("set_target_url", &ExternalReference::set_target_url)
        ;
        
    // Composable
    class_<Composable, emscripten::base<SerializableObjectWithMetadata>>("Composable")
        ;
        
    // Item
    class_<Item, emscripten::base<Composable>>("Item")
        .function("enabled", &Item::enabled)
        .function("set_enabled", &Item::set_enabled)
        .function("source_range", &Item::source_range)
        .function("set_source_range", &Item::set_source_range)
        ;
        
    // Gap
    class_<Gap, emscripten::base<Item>>("Gap")
        .constructor<TimeRange, std::string>()
        ;
        
    // Clip
    class_<Clip, emscripten::base<Item>>("Clip")
        .constructor<std::string>()
        .function("media_reference", &Clip::media_reference, allow_raw_pointers())
        .function("set_media_reference", &Clip::set_media_reference, allow_raw_pointers())
        ;
        
    // Composition
    class_<Composition, emscripten::base<Item>>("Composition")
        ;
        
    // Track
    class_<Track, emscripten::base<Composition>>("Track")
        .constructor<std::string>()
        .function("kind", &Track::kind)
        .function("set_kind", &Track::set_kind)
        ;
        
    // Stack
    class_<Stack, emscripten::base<Composition>>("Stack")
        .constructor<std::string>()
        ;
        
    // Timeline
    class_<Timeline, emscripten::base<SerializableObjectWithMetadata>>("Timeline")
        .constructor<std::string>()
        .function("tracks", &Timeline::tracks, allow_raw_pointers())
        .function("set_tracks", &Timeline::set_tracks, allow_raw_pointers())
        .function("global_start_time", &Timeline::global_start_time)
        .function("set_global_start_time", &Timeline::set_global_start_time)
        ;
        
#endif
} 