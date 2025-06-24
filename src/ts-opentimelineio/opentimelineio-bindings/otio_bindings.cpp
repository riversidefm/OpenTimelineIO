// SPDX-License-Identifier: Apache-2.0
// Copyright Contributors to the OpenTimelineIO project

#ifdef EMSCRIPTEN
#include <emscripten/bind.h>
#endif

#include "otio_bindings.h"
#include "opentimelineio/timeline.h"
#include "opentimelineio/track.h"
#include "opentimelineio/clip.h"
#include "opentimelineio/stack.h"
#include "opentimelineio/externalReference.h"
#include "opentimelineio/gap.h"
#include "opentimelineio/serialization.h"
#include "opentimelineio/deserialization.h"
#include "opentimelineio/anyDictionary.h"
#include "opentimelineio/serializableObject.h"
#include "opentimelineio/serializableObjectWithMetadata.h"
#include "opentimelineio/item.h"
#include "opentimelineio/composition.h"
#include "opentimelineio/mediaReference.h"
#include "opentimelineio/algo/editAlgorithm.h"
#include "opentime/rationalTime.h"
#include "opentime/timeRange.h"
#include "opentime/timeTransform.h"
#include <optional>
#include <memory>

#ifdef EMSCRIPTEN
using namespace emscripten;
using namespace opentimelineio::OPENTIMELINEIO_VERSION;
using namespace opentime::OPENTIME_VERSION;

// Custom deleter that works with OTIO's reference counting system
template<typename T>
struct OTIODeleter {
    void operator()(T* ptr) const {
        if (ptr) {
            ptr->possibly_delete();  // OTIO's proper cleanup method
        }
    }
};

// Wrapper functions that create OTIO objects and return void pointers (opaque handles)
// This avoids type registration issues with Embind
void* create_timeline(const std::string& name = "") {
    Timeline* timeline = new Timeline(name);
    // Properly initialize reference counting by creating a retainer and immediately releasing it
    SerializableObject::Retainer<Timeline> retainer(timeline);
    return static_cast<void*>(retainer.take_value());
}

void* create_track(const std::string& name = "", const std::string& kind = "Video") {
    Track* track = new Track(name, std::nullopt, kind);
    // Properly initialize reference counting
    SerializableObject::Retainer<Track> retainer(track);
    return static_cast<void*>(retainer.take_value());
}

void* create_clip(const std::string& name = "") {
    Clip* clip = new Clip(name);
    // Properly initialize reference counting
    SerializableObject::Retainer<Clip> retainer(clip);
    return static_cast<void*>(retainer.take_value());
}

void* create_external_reference(const std::string& target_url = "") {
    ExternalReference* ref = new ExternalReference(target_url);
    // Properly initialize reference counting
    SerializableObject::Retainer<ExternalReference> retainer(ref);
    return static_cast<void*>(retainer.take_value());
}

void* create_stack(const std::string& name = "") {
    Stack* stack = new Stack(name);
    // Properly initialize reference counting
    SerializableObject::Retainer<Stack> retainer(stack);
    return static_cast<void*>(retainer.take_value());
}

// Cleanup is now handled directly in the lambda functions below

// Test functions
std::string get_version() {
    return "OpenTimelineIO 0.18.0 (TypeScript Bindings) - Full Core Support";
}

bool test_connection() {
    return true;
}

EMSCRIPTEN_BINDINGS(otio_core) {
    // Bind OpenTime types with different names to avoid conflicts with the OpenTime module
    // These are needed for OpenTimelineIO functions to accept time parameters
    class_<RationalTime>("OTIORationalTime")
        .constructor<>()
        .constructor<double>()
        .constructor<double, double>()
        .function("value", &RationalTime::value)
        .function("rate", &RationalTime::rate)
        .function("to_seconds", static_cast<double(RationalTime::*)() const>(&RationalTime::to_seconds))
        .function("rescaled_to", static_cast<RationalTime(RationalTime::*)(double) const>(&RationalTime::rescaled_to))
        .function("almost_equal", &RationalTime::almost_equal)
        ;
        
    class_<TimeRange>("OTIOTimeRange")
        .constructor<>()
        .constructor<RationalTime>()
        .constructor<RationalTime, RationalTime>()
        .property("start_time", &TimeRange::start_time)
        .property("duration", &TimeRange::duration)
        .function("end_time_inclusive", &TimeRange::end_time_inclusive)
        .function("end_time_exclusive", &TimeRange::end_time_exclusive)
        .function("duration_extended_by", &TimeRange::duration_extended_by)
        .function("extended_by", &TimeRange::extended_by)
        .function("contains_time", static_cast<bool(TimeRange::*)(RationalTime) const>(&TimeRange::contains))
        ;
    
    class_<TimeTransform>("OTIOTimeTransform")
        .constructor<>()
        .constructor<RationalTime>()
        .constructor<RationalTime, double>()
        .constructor<RationalTime, double, double>()
        .property("offset", &TimeTransform::offset)
        .property("scale", &TimeTransform::scale)
        .property("rate", &TimeTransform::rate)
        ;
    
    // Arithmetic functions for RationalTime
    function("otio_add", +[](RationalTime a, RationalTime b) -> RationalTime {
        return a + b;
    });
    function("otio_subtract", +[](RationalTime a, RationalTime b) -> RationalTime {
        return a - b;
    });
    
    // Factory functions (return numeric handles instead of typed pointers)
    function("create_timeline", +[](const std::string& name) -> size_t {
        void* ptr = create_timeline(name);
        return reinterpret_cast<size_t>(ptr);
    });
    function("create_track", +[](const std::string& name, const std::string& kind) -> size_t {
        void* ptr = create_track(name, kind);
        return reinterpret_cast<size_t>(ptr);
    });
    function("create_clip", +[](const std::string& name) -> size_t {
        void* ptr = create_clip(name);
        return reinterpret_cast<size_t>(ptr);
    });
    function("create_external_reference", +[](const std::string& target_url) -> size_t {
        void* ptr = create_external_reference(target_url);
        return reinterpret_cast<size_t>(ptr);
    });
    function("create_stack", +[](const std::string& name) -> size_t {
        void* ptr = create_stack(name);
        return reinterpret_cast<size_t>(ptr);
    });
    
    // Cleanup functions (IMPORTANT: Use these to properly dispose of objects!)
    function("delete_timeline", +[](size_t ptr) {
        if (ptr == 0) return;
        try {
            Timeline* obj = reinterpret_cast<Timeline*>(ptr);
            if (obj) obj->possibly_delete();
        } catch (...) {
            // Ignore disposal errors (object may already be cleaned up)
        }
    });
    function("delete_track", +[](size_t ptr) {
        if (ptr == 0) return;
        try {
            Track* obj = reinterpret_cast<Track*>(ptr);
            if (obj) obj->possibly_delete();
        } catch (...) {
            // Ignore disposal errors (object may already be cleaned up)
        }
    });
    function("delete_clip", +[](size_t ptr) {
        if (ptr == 0) return;
        try {
            Clip* obj = reinterpret_cast<Clip*>(ptr);
            if (obj) obj->possibly_delete();
        } catch (...) {
            // Ignore disposal errors (object may already be cleaned up)
        }
    });
    function("delete_external_reference", +[](size_t ptr) {
        if (ptr == 0) return;
        try {
            ExternalReference* obj = reinterpret_cast<ExternalReference*>(ptr);
            if (obj) obj->possibly_delete();
        } catch (...) {
            // Ignore disposal errors (object may already be cleaned up)
        }
    });
    function("delete_stack", +[](size_t ptr) {
        if (ptr == 0) return;
        try {
            Stack* obj = reinterpret_cast<Stack*>(ptr);
            if (obj) obj->possibly_delete();
        } catch (...) {
            // Ignore disposal errors (object may already be cleaned up)
        }
    });
    
    // Timeline utility functions (using size_t to avoid type issues)
    function("timeline_name", 
        +[](size_t ptr) -> std::string { 
            if (ptr == 0) return "";
            Timeline* obj = reinterpret_cast<Timeline*>(ptr);
            return obj ? obj->name() : ""; 
        });
    function("timeline_set_name", 
        +[](size_t ptr, const std::string& name) { 
            if (ptr == 0) return;
            Timeline* obj = reinterpret_cast<Timeline*>(ptr);
            if (obj) obj->set_name(name); 
        });
    function("timeline_to_json_string", 
        +[](size_t ptr) -> std::string { 
            if (ptr == 0) return "null";
            Timeline* obj = reinterpret_cast<Timeline*>(ptr);
            if (!obj) return "null";
            
            try {
                // Create a temporary retainer to ensure proper reference counting during serialization
                SerializableObject::Retainer<Timeline> temp_retainer(obj);
                std::string result = obj->to_json_string();
                temp_retainer.take_value(); // Release without decrementing (since we don't own it)
                return result;
            } catch (...) {
                return "null";
            }
        });
    function("timeline_schema_name", 
        +[](size_t ptr) -> std::string { 
            if (ptr == 0) return "";
            Timeline* obj = reinterpret_cast<Timeline*>(ptr);
            return obj ? obj->schema_name() : ""; 
        });
    function("timeline_schema_version", 
        +[](size_t ptr) -> int { 
            if (ptr == 0) return 0;
            Timeline* obj = reinterpret_cast<Timeline*>(ptr);
            return obj ? obj->schema_version() : 0; 
        });
    function("timeline_duration", 
        +[](size_t ptr) -> RationalTime { 
            if (ptr == 0) return RationalTime();
            Timeline* obj = reinterpret_cast<Timeline*>(ptr);
            return obj ? obj->duration(nullptr) : RationalTime(); 
        });
    
    // Clip utility functions
    function("clip_name", 
        +[](size_t ptr) -> std::string { 
            if (ptr == 0) return "";
            Clip* obj = reinterpret_cast<Clip*>(ptr);
            return obj ? obj->name() : ""; 
        });
    function("clip_set_name", 
        +[](size_t ptr, const std::string& name) { 
            if (ptr == 0) return;
            Clip* obj = reinterpret_cast<Clip*>(ptr);
            if (obj) obj->set_name(name); 
        });
    function("clip_source_range", 
        +[](size_t ptr) -> TimeRange { 
            if (ptr == 0) return TimeRange();
            Clip* obj = reinterpret_cast<Clip*>(ptr);
            if (!obj) return TimeRange();
            auto range = obj->source_range();
            return range.has_value() ? range.value() : TimeRange();
        });
    function("clip_set_source_range", 
        +[](size_t ptr, const TimeRange& range) { 
            if (ptr == 0) return;
            Clip* obj = reinterpret_cast<Clip*>(ptr);
            if (obj) obj->set_source_range(range); 
        });
    function("clip_duration", 
        +[](size_t ptr) -> RationalTime { 
            if (ptr == 0) return RationalTime();
            Clip* obj = reinterpret_cast<Clip*>(ptr);
            return obj ? obj->duration(nullptr) : RationalTime(); 
        });
    function("clip_enabled", 
        +[](size_t ptr) -> bool { 
            if (ptr == 0) return false;
            Clip* obj = reinterpret_cast<Clip*>(ptr);
            return obj ? obj->enabled() : false; 
        });
    function("clip_set_enabled", 
        +[](size_t ptr, bool enabled) { 
            if (ptr == 0) return;
            Clip* obj = reinterpret_cast<Clip*>(ptr);
            if (obj) obj->set_enabled(enabled); 
        });
    function("clip_to_json_string", 
        +[](size_t ptr) -> std::string { 
            if (ptr == 0) return "null";
            Clip* obj = reinterpret_cast<Clip*>(ptr);
            if (!obj) return "null";
            
            try {
                // Create a temporary retainer to ensure proper reference counting during serialization
                SerializableObject::Retainer<Clip> temp_retainer(obj);
                std::string result = obj->to_json_string();
                temp_retainer.take_value(); // Release without decrementing (since we don't own it)
                return result;
            } catch (...) {
                return "null";
            }
        });
    function("clip_media_reference", 
        +[](size_t ptr) -> size_t { 
            if (ptr == 0) return 0;
            Clip* obj = reinterpret_cast<Clip*>(ptr);
            ExternalReference* ref = obj ? dynamic_cast<ExternalReference*>(obj->media_reference()) : nullptr;
            return reinterpret_cast<size_t>(ref);
        });
    function("clip_set_media_reference", 
        +[](size_t ptr, size_t refPtr) { 
            if (ptr == 0 || refPtr == 0) return;
            Clip* obj = reinterpret_cast<Clip*>(ptr);
            ExternalReference* ref = reinterpret_cast<ExternalReference*>(refPtr);
            if (obj) obj->set_media_reference(ref); 
        });
    
    // Track utility functions
    function("track_name", 
        +[](size_t ptr) -> std::string { 
            if (ptr == 0) return "";
            Track* obj = reinterpret_cast<Track*>(ptr);
            return obj ? obj->name() : ""; 
        });
    function("track_set_name", 
        +[](size_t ptr, const std::string& name) { 
            if (ptr == 0) return;
            Track* obj = reinterpret_cast<Track*>(ptr);
            if (obj) obj->set_name(name); 
        });
    function("track_kind", 
        +[](size_t ptr) -> std::string { 
            if (ptr == 0) return "";
            Track* obj = reinterpret_cast<Track*>(ptr);
            return obj ? obj->kind() : ""; 
        });
    function("track_set_kind", 
        +[](size_t ptr, const std::string& kind) { 
            if (ptr == 0) return;
            Track* obj = reinterpret_cast<Track*>(ptr);
            if (obj) obj->set_kind(kind); 
        });
    function("track_enabled", 
        +[](size_t ptr) -> bool { 
            if (ptr == 0) return false;
            Track* obj = reinterpret_cast<Track*>(ptr);
            return obj ? obj->enabled() : false; 
        });
    function("track_set_enabled", 
        +[](size_t ptr, bool enabled) { 
            if (ptr == 0) return;
            Track* obj = reinterpret_cast<Track*>(ptr);
            if (obj) obj->set_enabled(enabled); 
        });
    function("track_to_json_string", 
        +[](size_t ptr) -> std::string { 
            if (ptr == 0) return "null";
            Track* obj = reinterpret_cast<Track*>(ptr);
            if (!obj) return "null";
            
            try {
                // Create a temporary retainer to ensure proper reference counting during serialization
                SerializableObject::Retainer<Track> temp_retainer(obj);
                std::string result = obj->to_json_string();
                temp_retainer.take_value(); // Release without decrementing (since we don't own it)
                return result;
            } catch (...) {
                return "null";
            }
        });
    
    // ExternalReference utility functions
    function("external_reference_name", 
        +[](size_t ptr) -> std::string { 
            if (ptr == 0) return "";
            ExternalReference* obj = reinterpret_cast<ExternalReference*>(ptr);
            return obj ? obj->name() : ""; 
        });
    function("external_reference_set_name", 
        +[](size_t ptr, const std::string& name) { 
            if (ptr == 0) return;
            ExternalReference* obj = reinterpret_cast<ExternalReference*>(ptr);
            if (obj) obj->set_name(name); 
        });
    function("external_reference_target_url", 
        +[](size_t ptr) -> std::string { 
            if (ptr == 0) return "";
            ExternalReference* obj = reinterpret_cast<ExternalReference*>(ptr);
            return obj ? obj->target_url() : ""; 
        });
    function("external_reference_set_target_url", 
        +[](size_t ptr, const std::string& url) { 
            if (ptr == 0) return;
            ExternalReference* obj = reinterpret_cast<ExternalReference*>(ptr);
            if (obj) obj->set_target_url(url); 
        });
    function("external_reference_is_missing_reference", 
        +[](size_t ptr) -> bool { 
            if (ptr == 0) return true;
            ExternalReference* obj = reinterpret_cast<ExternalReference*>(ptr);
            return obj ? obj->is_missing_reference() : true; 
        });
    function("external_reference_to_json_string", 
        +[](size_t ptr) -> std::string { 
            if (ptr == 0) return "null";
            ExternalReference* obj = reinterpret_cast<ExternalReference*>(ptr);
            if (!obj) return "null";
            
            try {
                // Create a temporary retainer to ensure proper reference counting during serialization
                SerializableObject::Retainer<ExternalReference> temp_retainer(obj);
                std::string result = obj->to_json_string();
                temp_retainer.take_value(); // Release without decrementing (since we don't own it)
                return result;
            } catch (...) {
                return "null";
            }
        });
    
    // Composition functions (Timeline and Track inherit from Composition)
    
    // Timeline tracks access
    function("timeline_tracks", 
        +[](size_t ptr) -> size_t { 
            if (ptr == 0) return 0;
            Timeline* obj = reinterpret_cast<Timeline*>(ptr);
            Stack* tracks = obj ? obj->tracks() : nullptr;
            return reinterpret_cast<size_t>(tracks);
        });
    
    // Stack/Composition children operations
    function("composition_children_count", 
        +[](size_t ptr) -> int { 
            if (ptr == 0) return 0;
            Composition* obj = reinterpret_cast<Composition*>(ptr);
            return obj ? static_cast<int>(obj->children().size()) : 0; 
        });
    function("composition_child_at_index", 
        +[](size_t ptr, int index) -> size_t { 
            if (ptr == 0) return 0;
            Composition* obj = reinterpret_cast<Composition*>(ptr);
            if (!obj) return 0;
            const auto& children = obj->children();
            if (index < 0 || index >= static_cast<int>(children.size())) return 0;
            // Access the retainer and get the raw pointer using .value
            const auto& retainer = children[index];
            Composable* child = retainer.value;
            return reinterpret_cast<size_t>(child);
        });
    function("composition_append_child", 
        +[](size_t ptr, size_t childPtr) -> bool { 
            if (ptr == 0 || childPtr == 0) return false;
            Composition* obj = reinterpret_cast<Composition*>(ptr);
            Composable* child = reinterpret_cast<Composable*>(childPtr);
            return obj ? obj->append_child(child) : false; 
        });
    function("composition_insert_child", 
        +[](size_t ptr, int index, size_t childPtr) -> bool { 
            if (ptr == 0 || childPtr == 0) return false;
            Composition* obj = reinterpret_cast<Composition*>(ptr);
            Composable* child = reinterpret_cast<Composable*>(childPtr);
            return obj ? obj->insert_child(index, child) : false; 
        });
    function("composition_remove_child", 
        +[](size_t ptr, int index) -> bool { 
            if (ptr == 0) return false;
            Composition* obj = reinterpret_cast<Composition*>(ptr);
            return obj ? obj->remove_child(index) : false; 
        });
    function("composition_index_of_child", 
        +[](size_t ptr, size_t childPtr) -> int { 
            if (ptr == 0 || childPtr == 0) return -1;
            Composition* obj = reinterpret_cast<Composition*>(ptr);
            Composable* child = reinterpret_cast<Composable*>(childPtr);
            return obj ? obj->index_of_child(child) : -1; 
        });
    
    // Stack utility functions (same as composition but for clarity)
    function("stack_name", 
        +[](size_t ptr) -> std::string { 
            if (ptr == 0) return "";
            Stack* obj = reinterpret_cast<Stack*>(ptr);
            return obj ? obj->name() : ""; 
        });
    function("stack_set_name", 
        +[](size_t ptr, const std::string& name) { 
            if (ptr == 0) return;
            Stack* obj = reinterpret_cast<Stack*>(ptr);
            if (obj) obj->set_name(name); 
        });
    function("stack_to_json_string", 
        +[](size_t ptr) -> std::string { 
            if (ptr == 0) return "null";
            Stack* obj = reinterpret_cast<Stack*>(ptr);
            if (!obj) return "null";
            
            try {
                // Create a temporary retainer to ensure proper reference counting during serialization
                SerializableObject::Retainer<Stack> temp_retainer(obj);
                std::string result = obj->to_json_string();
                temp_retainer.take_value(); // Release without decrementing (since we don't own it)
                return result;
            } catch (...) {
                return "null";
            }
        });
    
    // Helper function to determine object type for wrapper creation
    function("get_object_schema_name", 
        +[](size_t ptr) -> std::string { 
            if (ptr == 0) return "";
            SerializableObject* obj = reinterpret_cast<SerializableObject*>(ptr);
            return obj ? obj->schema_name() : ""; 
        });
    
    // Advanced editing algorithm bindings
    function("timeline_overwrite_clip", 
        +[](size_t timelinePtr, size_t clipPtr, const TimeRange& range, bool removeTransitions) -> bool {
            if (timelinePtr == 0 || clipPtr == 0) return false;
            Timeline* timeline = reinterpret_cast<Timeline*>(timelinePtr);
            Clip* clip = reinterpret_cast<Clip*>(clipPtr);
            if (!timeline || !clip) return false;
            
            // Get the first video track for simplicity
            auto videoTracks = timeline->video_tracks();
            if (videoTracks.empty()) return false;
            
            opentimelineio::OPENTIMELINEIO_VERSION::ErrorStatus error;
            opentimelineio::OPENTIMELINEIO_VERSION::algo::overwrite(
                clip, videoTracks[0], range, removeTransitions, nullptr, &error);
            return !opentimelineio::OPENTIMELINEIO_VERSION::is_error(&error);
        });
    
    function("timeline_insert_clip", 
        +[](size_t timelinePtr, size_t clipPtr, const RationalTime& time, bool removeTransitions) -> bool {
            if (timelinePtr == 0 || clipPtr == 0) return false;
            Timeline* timeline = reinterpret_cast<Timeline*>(timelinePtr);
            Clip* clip = reinterpret_cast<Clip*>(clipPtr);
            if (!timeline || !clip) return false;
            
            auto videoTracks = timeline->video_tracks();
            if (videoTracks.empty()) return false;
            
            opentimelineio::OPENTIMELINEIO_VERSION::ErrorStatus error;
            opentimelineio::OPENTIMELINEIO_VERSION::algo::insert(
                clip, videoTracks[0], time, removeTransitions, nullptr, &error);
            return !opentimelineio::OPENTIMELINEIO_VERSION::is_error(&error);
        });
    
    function("timeline_slice_at_time", 
        +[](size_t timelinePtr, const RationalTime& time, bool removeTransitions) -> bool {
            if (timelinePtr == 0) return false;
            Timeline* timeline = reinterpret_cast<Timeline*>(timelinePtr);
            if (!timeline) return false;
            
            auto videoTracks = timeline->video_tracks();
            if (videoTracks.empty()) return false;
            
            opentimelineio::OPENTIMELINEIO_VERSION::ErrorStatus error;
            opentimelineio::OPENTIMELINEIO_VERSION::algo::slice(
                videoTracks[0], time, removeTransitions, &error);
            return !opentimelineio::OPENTIMELINEIO_VERSION::is_error(&error);
        });
    
    function("clip_trim", 
        +[](size_t clipPtr, const RationalTime& deltaIn, const RationalTime& deltaOut) -> bool {
            if (clipPtr == 0) return false;
            Clip* clip = reinterpret_cast<Clip*>(clipPtr);
            if (!clip) return false;
            
            opentimelineio::OPENTIMELINEIO_VERSION::ErrorStatus error;
            opentimelineio::OPENTIMELINEIO_VERSION::algo::trim(
                clip, deltaIn, deltaOut, nullptr, &error);
            return !opentimelineio::OPENTIMELINEIO_VERSION::is_error(&error);
        });
    
    function("clip_slip", 
        +[](size_t clipPtr, const RationalTime& delta) {
            if (clipPtr == 0) return;
            Clip* clip = reinterpret_cast<Clip*>(clipPtr);
            if (!clip) return;
            
            opentimelineio::OPENTIMELINEIO_VERSION::algo::slip(clip, delta);
        });
    
    function("clip_slide", 
        +[](size_t clipPtr, const RationalTime& delta) {
            if (clipPtr == 0) return;
            Clip* clip = reinterpret_cast<Clip*>(clipPtr);
            if (!clip) return;
            
            opentimelineio::OPENTIMELINEIO_VERSION::algo::slide(clip, delta);
        });
    
    // Effects and Markers support
    function("clip_effects_count", 
        +[](size_t ptr) -> int { 
            if (ptr == 0) return 0;
            Clip* obj = reinterpret_cast<Clip*>(ptr);
            return obj ? static_cast<int>(obj->effects().size()) : 0; 
        });
    
    function("clip_markers_count", 
        +[](size_t ptr) -> int { 
            if (ptr == 0) return 0;
            Clip* obj = reinterpret_cast<Clip*>(ptr);
            return obj ? static_cast<int>(obj->markers().size()) : 0; 
        });
    
    function("track_effects_count", 
        +[](size_t ptr) -> int { 
            if (ptr == 0) return 0;
            Track* obj = reinterpret_cast<Track*>(ptr);
            return obj ? static_cast<int>(obj->effects().size()) : 0; 
        });
    
    function("track_markers_count", 
        +[](size_t ptr) -> int { 
            if (ptr == 0) return 0;
            Track* obj = reinterpret_cast<Track*>(ptr);
            return obj ? static_cast<int>(obj->markers().size()) : 0; 
        });
    
    // Advanced clip properties
    function("clip_available_range", 
        +[](size_t ptr) -> TimeRange { 
            if (ptr == 0) return TimeRange();
            Clip* obj = reinterpret_cast<Clip*>(ptr);
            if (!obj) return TimeRange();
            opentimelineio::OPENTIMELINEIO_VERSION::ErrorStatus error;
            return obj->available_range(&error);
        });
    
    function("clip_trimmed_range", 
        +[](size_t ptr) -> TimeRange { 
            if (ptr == 0) return TimeRange();
            Clip* obj = reinterpret_cast<Clip*>(ptr);
            if (!obj) return TimeRange();
            opentimelineio::OPENTIMELINEIO_VERSION::ErrorStatus error;
            return obj->trimmed_range(&error);
        });
    
    function("clip_visible_range", 
        +[](size_t ptr) -> TimeRange { 
            if (ptr == 0) return TimeRange();
            Clip* obj = reinterpret_cast<Clip*>(ptr);
            if (!obj) return TimeRange();
            opentimelineio::OPENTIMELINEIO_VERSION::ErrorStatus error;
            return obj->visible_range(&error);
        });
    
    // Media reference advanced properties
    function("external_reference_available_range", 
        +[](size_t ptr) -> TimeRange { 
            if (ptr == 0) return TimeRange();
            ExternalReference* obj = reinterpret_cast<ExternalReference*>(ptr);
            if (!obj) return TimeRange();
            auto range = obj->available_range();
            return range.has_value() ? range.value() : TimeRange();
        });
    
    function("external_reference_set_available_range", 
        +[](size_t ptr, const TimeRange& range) { 
            if (ptr == 0) return;
            ExternalReference* obj = reinterpret_cast<ExternalReference*>(ptr);
            if (obj) obj->set_available_range(range); 
        });
    
    // Timeline-level operations
    function("timeline_global_start_time", 
        +[](size_t ptr) -> RationalTime { 
            if (ptr == 0) return RationalTime();
            Timeline* obj = reinterpret_cast<Timeline*>(ptr);
            if (!obj) return RationalTime();
            auto time = obj->global_start_time();
            return time.has_value() ? time.value() : RationalTime();
        });
    
    function("timeline_set_global_start_time", 
        +[](size_t ptr, const RationalTime& time) { 
            if (ptr == 0) return;
            Timeline* obj = reinterpret_cast<Timeline*>(ptr);
            if (obj) obj->set_global_start_time(time); 
        });
    
    // Audio tracks access
    function("timeline_audio_tracks_count", 
        +[](size_t ptr) -> int { 
            if (ptr == 0) return 0;
            Timeline* obj = reinterpret_cast<Timeline*>(ptr);
            if (!obj) return 0;
            auto tracks = obj->audio_tracks();
            return static_cast<int>(tracks.size());
        });
    
    function("timeline_audio_track_at_index", 
        +[](size_t ptr, int index) -> size_t { 
            if (ptr == 0) return 0;
            Timeline* obj = reinterpret_cast<Timeline*>(ptr);
            if (!obj) return 0;
            auto tracks = obj->audio_tracks();
            if (index < 0 || index >= static_cast<int>(tracks.size())) return 0;
            return reinterpret_cast<size_t>(tracks[index]);
        });
    
    // Video tracks access
    function("timeline_video_tracks_count", 
        +[](size_t ptr) -> int { 
            if (ptr == 0) return 0;
            Timeline* obj = reinterpret_cast<Timeline*>(ptr);
            if (!obj) return 0;
            auto tracks = obj->video_tracks();
            return static_cast<int>(tracks.size());
        });
    
    function("timeline_video_track_at_index", 
        +[](size_t ptr, int index) -> size_t { 
            if (ptr == 0) return 0;
            Timeline* obj = reinterpret_cast<Timeline*>(ptr);
            if (!obj) return 0;
            auto tracks = obj->video_tracks();
            if (index < 0 || index >= static_cast<int>(tracks.size())) return 0;
            return reinterpret_cast<size_t>(tracks[index]);
        });
    
    // Advanced track operations
    function("track_available_range", 
        +[](size_t ptr) -> TimeRange { 
            if (ptr == 0) return TimeRange();
            Track* obj = reinterpret_cast<Track*>(ptr);
            if (!obj) return TimeRange();
            opentimelineio::OPENTIMELINEIO_VERSION::ErrorStatus error;
            return obj->available_range(&error);
        });
    
    function("track_range_of_child_at_index", 
        +[](size_t ptr, int index) -> TimeRange { 
            if (ptr == 0) return TimeRange();
            Track* obj = reinterpret_cast<Track*>(ptr);
            if (!obj) return TimeRange();
            opentimelineio::OPENTIMELINEIO_VERSION::ErrorStatus error;
            return obj->range_of_child_at_index(index, &error);
        });
    
    function("track_trimmed_range_of_child_at_index", 
        +[](size_t ptr, int index) -> TimeRange { 
            if (ptr == 0) return TimeRange();
            Track* obj = reinterpret_cast<Track*>(ptr);
            if (!obj) return TimeRange();
            opentimelineio::OPENTIMELINEIO_VERSION::ErrorStatus error;
            return obj->trimmed_range_of_child_at_index(index, &error);
        });
    
    // Gap creation and handling
    function("create_gap", +[](const TimeRange& sourceRange, const std::string& name) -> size_t {
        Gap* gap = new Gap(sourceRange, name);
        SerializableObject::Retainer<Gap> retainer(gap);
        return reinterpret_cast<size_t>(retainer.take_value());
    });
    
    function("create_gap_with_duration", +[](const RationalTime& duration, const std::string& name) -> size_t {
        Gap* gap = new Gap(duration, name);
        SerializableObject::Retainer<Gap> retainer(gap);
        return reinterpret_cast<size_t>(retainer.take_value());
    });
    
    function("delete_gap", +[](size_t ptr) {
        if (ptr == 0) return;
        try {
            Gap* obj = reinterpret_cast<Gap*>(ptr);
            if (obj) obj->possibly_delete();
        } catch (...) {
            // Ignore disposal errors (object may already be cleaned up)
        }
    });
    
    function("gap_to_json_string", 
        +[](size_t ptr) -> std::string { 
            if (ptr == 0) return "null";
            Gap* obj = reinterpret_cast<Gap*>(ptr);
            if (!obj) return "null";
            
            try {
                SerializableObject::Retainer<Gap> temp_retainer(obj);
                std::string result = obj->to_json_string();
                temp_retainer.take_value();
                return result;
            } catch (...) {
                return "null";
            }
        });
    
    // Test functions
    function("get_version", &get_version);
    function("test_connection", &test_connection);
}
#endif 