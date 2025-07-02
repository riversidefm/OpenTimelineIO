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
#include "opentimelineio/effect.h"
#include "opentimelineio/serializableObject.h"
#include "opentimelineio/errorStatus.h"

using namespace opentimelineio::OPENTIMELINEIO_VERSION;
using namespace opentime::OPENTIME_VERSION;

// Factory functions to work around protected destructors
#ifdef EMSCRIPTEN
static emscripten::val create_timeline(const std::string& name) {
    auto* timeline = new Timeline(name);
    return emscripten::val(timeline);
}

static emscripten::val create_external_reference(const std::string& url) {
    auto* ref = new ExternalReference(url);
    return emscripten::val(ref);
}

static emscripten::val create_clip(const std::string& name) {
    auto* clip = new Clip(name);
    return emscripten::val(clip);
}

static emscripten::val create_track(const std::string& name) {
    auto* track = new Track(name);
    return emscripten::val(track);
}

static emscripten::val create_effect(const std::string& name, const std::string& effect_name) {
    auto* effect = new Effect(name, effect_name);
    return emscripten::val(effect);
}
#endif

void otio_serializable_object_bindings() {
#ifdef EMSCRIPTEN
    using namespace emscripten;
    
    // Factory functions
    function("create_timeline", &create_timeline);
    function("create_external_reference", &create_external_reference);
    function("create_clip", &create_clip);
    function("create_track", &create_track);
    function("create_effect", &create_effect);
    
    // Basic SerializableObject interface (no constructor due to protected destructor)
    class_<SerializableObject>("SerializableObject")
        .function("schema_name", &SerializableObject::schema_name)
        .function("schema_version", &SerializableObject::schema_version)
        ;
        
    // SerializableObjectWithMetadata
    class_<SerializableObjectWithMetadata, base<SerializableObject>>("SerializableObjectWithMetadata")
        .function("name", &SerializableObjectWithMetadata::name)
        .function("set_name", &SerializableObjectWithMetadata::set_name)
        ;
        
    // Timeline
    class_<Timeline, base<SerializableObjectWithMetadata>>("Timeline")
        .function("tracks", &Timeline::tracks, allow_raw_pointers())
        .function("set_tracks", &Timeline::set_tracks, allow_raw_pointers())
        .function("global_start_time", &Timeline::global_start_time)
        .function("set_global_start_time", &Timeline::set_global_start_time)
        ;
        
    // MediaReference
    class_<MediaReference, base<SerializableObjectWithMetadata>>("MediaReference")
        .function("is_missing_reference", &MediaReference::is_missing_reference)
        ;
        
    // ExternalReference
    class_<ExternalReference, base<MediaReference>>("ExternalReference")
        .function("target_url", &ExternalReference::target_url)
        .function("set_target_url", &ExternalReference::set_target_url)
        ;
        
    // Composable
    class_<Composable, base<SerializableObjectWithMetadata>>("Composable")
        ;
        
    // Item
    class_<Item, base<Composable>>("Item")
        .function("enabled", &Item::enabled)
        .function("set_enabled", &Item::set_enabled)
        .function("source_range", &Item::source_range)
        .function("set_source_range", &Item::set_source_range)
        ;
        
    // Clip
    class_<Clip, base<Item>>("Clip")
        .function("media_reference", &Clip::media_reference, allow_raw_pointers())
        .function("set_media_reference", &Clip::set_media_reference, allow_raw_pointers())
        ;
        
    // Composition
    class_<Composition, base<Item>>("Composition")
        ;
        
    // Track
    class_<Track, base<Composition>>("Track")
        .function("kind", &Track::kind)
        .function("set_kind", &Track::set_kind)
        ;
    
    // Effect
    class_<Effect, base<SerializableObjectWithMetadata>>("Effect")
        .function("effect_name", &Effect::effect_name)
        .function("set_effect_name", &Effect::set_effect_name)
        .function("enabled", &Effect::enabled)
        .function("set_enabled", &Effect::set_enabled)
        ;
        
#endif
} 