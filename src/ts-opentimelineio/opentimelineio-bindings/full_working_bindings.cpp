#include <emscripten/bind.h>
#include <string>

// OpenTime includes
#include "opentime/rationalTime.h"
#include "opentime/timeRange.h"
#include "opentime/timeTransform.h"

// OTIO includes  
#include "opentimelineio/timeline.h"
#include "opentimelineio/clip.h"
#include "opentimelineio/track.h"
#include "opentimelineio/externalReference.h"
#include "opentimelineio/stack.h"
#include "opentimelineio/gap.h"

using namespace opentime;
using namespace opentimelineio::OPENTIMELINEIO_VERSION;

// Test functions
std::string get_version() {
    return "OTIO Complete Bindings 1.0";
}

void test_connection() {
    // Simple test function
}

// OpenTime helper functions
std::string opentime_js_str(RationalTime rt) {
    return std::to_string(rt.value()) + "/" + std::to_string(rt.rate());
}

std::string opentime_js_repr(RationalTime rt) {
    return "RationalTime(" + std::to_string(rt.value()) + ", " + std::to_string(rt.rate()) + ")";
}

EMSCRIPTEN_BINDINGS(complete_otio) {
    using namespace emscripten;
    
    // Test functions
    function("get_version", &get_version);
    function("test_connection", &test_connection);
    
    // ===== OpenTime Bindings =====
    
    class_<RationalTime>("RationalTime")
        .constructor<>()
        .constructor<double>()
        .constructor<double, double>()
        .function("value", &RationalTime::value)
        .function("rate", &RationalTime::rate)
        .function("is_invalid_time", &RationalTime::is_invalid_time)
        .function("__str__", &opentime_js_str)
        .function("__repr__", &opentime_js_repr)
        .function("rescaled_to", select_overload<RationalTime(double) const>(&RationalTime::rescaled_to))
        .function("rescaled_to", select_overload<RationalTime(RationalTime) const>(&RationalTime::rescaled_to))
        .function("value_rescaled_to", select_overload<double(double) const>(&RationalTime::value_rescaled_to))
        .function("value_rescaled_to", select_overload<double(RationalTime) const>(&RationalTime::value_rescaled_to))
        .function("almost_equal", &RationalTime::almost_equal)
        .function("to_frames", select_overload<int() const>(&RationalTime::to_frames))
        .function("to_frames", select_overload<int(double) const>(&RationalTime::to_frames))
        .function("to_seconds", &RationalTime::to_seconds)
        // Static methods
        .class_function("duration_from_start_end_time", &RationalTime::duration_from_start_end_time)
        .class_function("duration_from_start_end_time_inclusive", &RationalTime::duration_from_start_end_time_inclusive)
        .class_function("from_frames", &RationalTime::from_frames)
        .class_function("from_seconds", select_overload<RationalTime(double)>(&RationalTime::from_seconds))
        .class_function("from_seconds", select_overload<RationalTime(double, double)>(&RationalTime::from_seconds))
        ;
        
    // Standalone operator functions
    function("add", +[](const RationalTime& a, const RationalTime& b) -> RationalTime { return a + b; });
    function("subtract", +[](const RationalTime& a, const RationalTime& b) -> RationalTime { return a - b; });
    
    class_<TimeRange>("TimeRange")
        .constructor<>()
        .constructor<RationalTime>()
        .constructor<RationalTime, RationalTime>()
        .property("start_time", &TimeRange::start_time)
        .property("duration", &TimeRange::duration)
        .function("end_time_inclusive", &TimeRange::end_time_inclusive)
        .function("end_time_exclusive", &TimeRange::end_time_exclusive)
        .function("duration_extended_by", &TimeRange::duration_extended_by)
        .function("extended_by", &TimeRange::extended_by)
        .function("clamped", +[](const TimeRange& self, RationalTime time) -> RationalTime { return self.clamped(time); })
        .function("clamped", +[](const TimeRange& self, const TimeRange& range) -> TimeRange { return self.clamped(range); })
        .function("contains", +[](const TimeRange& self, RationalTime time) -> bool { return self.contains(time); })
        .function("contains", +[](const TimeRange& self, const TimeRange& range) -> bool { return self.contains(range); })
        .function("overlaps", +[](const TimeRange& self, RationalTime time) -> bool { return self.overlaps(time); })
        .function("overlaps", +[](const TimeRange& self, const TimeRange& range) -> bool { return self.overlaps(range); })
        .function("intersects", +[](const TimeRange& self, const TimeRange& range) -> bool { return self.intersects(range); })
        // Static methods
        .class_function("range_from_start_end_time", &TimeRange::range_from_start_end_time)
        .class_function("range_from_start_end_time_inclusive", &TimeRange::range_from_start_end_time_inclusive)
        ;
        
    class_<TimeTransform>("TimeTransform")
        .constructor<>()
        .constructor<RationalTime>()
        .constructor<RationalTime, double>()
        .constructor<RationalTime, double, double>()
        .property("offset", &TimeTransform::offset)
        .property("scale", &TimeTransform::scale)
        .property("rate", &TimeTransform::rate)
        .function("applied_to", +[](const TimeTransform& self, RationalTime time) -> RationalTime { return self.applied_to(time); })
        .function("applied_to", +[](const TimeTransform& self, const TimeRange& range) -> TimeRange { return self.applied_to(range); })
        ;

    // ===== OTIO Factory Functions (using handles) =====
    
    // Timeline functions
    function("create_timeline", +[](const std::string& name) -> size_t {
        Timeline* timeline = new Timeline(name);
        timeline->possibly_retain();
        return reinterpret_cast<size_t>(timeline);
    });
    
    function("timeline_name", +[](size_t ptr) -> std::string {
        if (ptr == 0) return "";
        Timeline* obj = reinterpret_cast<Timeline*>(ptr);
        return obj ? obj->name() : "";
    });
    
    function("timeline_duration", +[](size_t ptr) -> RationalTime {
        if (ptr == 0) return RationalTime();
        Timeline* obj = reinterpret_cast<Timeline*>(ptr);
        if (!obj) return RationalTime();
        auto errorStatus = opentimelineio::OPENTIMELINEIO_VERSION::ErrorStatus();
        return obj->duration(&errorStatus);
    });
    
    // Track functions  
    function("create_track", +[](const std::string& name, const std::string& kind) -> size_t {
        Track* track = new Track(name, nullopt, RationalTime(), kind);
        track->possibly_retain();
        return reinterpret_cast<size_t>(track);
    });
    
    function("track_name", +[](size_t ptr) -> std::string {
        if (ptr == 0) return "";
        Track* obj = reinterpret_cast<Track*>(ptr);
        return obj ? obj->name() : "";
    });
    
    // Clip functions
    function("create_clip", +[](const std::string& name, size_t media_ref, RationalTime source_range_start, RationalTime source_range_duration) -> size_t {
        ExternalReference* ref = nullptr;
        if (media_ref != 0) {
            ref = reinterpret_cast<ExternalReference*>(media_ref);
        }
        
        TimeRange source_range(source_range_start, source_range_duration);
        Clip* clip = new Clip(name, ref, source_range);
        clip->possibly_retain();
        return reinterpret_cast<size_t>(clip);
    });
    
    function("clip_name", +[](size_t ptr) -> std::string {
        if (ptr == 0) return "";
        Clip* obj = reinterpret_cast<Clip*>(ptr);
        return obj ? obj->name() : "";
    });
    
    // ExternalReference functions
    function("create_external_reference", +[](const std::string& target_url, RationalTime available_start, RationalTime available_duration) -> size_t {
        TimeRange available_range(available_start, available_duration);
        ExternalReference* ref = new ExternalReference(target_url, available_range);
        ref->possibly_retain();
        return reinterpret_cast<size_t>(ref);
    });
    
    function("external_reference_target_url", +[](size_t ptr) -> std::string {
        if (ptr == 0) return "";
        ExternalReference* obj = reinterpret_cast<ExternalReference*>(ptr);
        return obj ? obj->target_url() : "";
    });
    
    // Basic composition functions
    function("timeline_tracks", +[](size_t ptr) -> size_t {
        if (ptr == 0) return 0;
        Timeline* obj = reinterpret_cast<Timeline*>(ptr);
        if (!obj) return 0;
        return reinterpret_cast<size_t>(&(obj->tracks()));
    });
    
    function("composition_children_count", +[](size_t ptr) -> int {
        if (ptr == 0) return 0;
        Composition* obj = reinterpret_cast<Composition*>(ptr);
        if (!obj) return 0;
        return obj->children().size();
    });
    
    function("composition_append_child", +[](size_t composition_ptr, size_t child_ptr) -> bool {
        if (composition_ptr == 0 || child_ptr == 0) return false;
        Composition* comp = reinterpret_cast<Composition*>(composition_ptr);
        Composable* child = reinterpret_cast<Composable*>(child_ptr);
        if (!comp || !child) return false;
        
        auto errorStatus = opentimelineio::OPENTIMELINEIO_VERSION::ErrorStatus();
        return comp->append_child(child, &errorStatus);
    });
    
    // Cleanup functions
    function("delete_timeline", +[](size_t ptr) {
        if (ptr == 0) return;
        Timeline* obj = reinterpret_cast<Timeline*>(ptr);
        if (obj) obj->possibly_delete();
    });
    
    function("delete_track", +[](size_t ptr) {
        if (ptr == 0) return;
        Track* obj = reinterpret_cast<Track*>(ptr);
        if (obj) obj->possibly_delete();
    });
    
    function("delete_clip", +[](size_t ptr) {
        if (ptr == 0) return;
        Clip* obj = reinterpret_cast<Clip*>(ptr);
        if (obj) obj->possibly_delete();
    });
    
    function("delete_external_reference", +[](size_t ptr) {
        if (ptr == 0) return;
        ExternalReference* obj = reinterpret_cast<ExternalReference*>(ptr);
        if (obj) obj->possibly_delete();
    });
} 