#include <emscripten/bind.h>
#include <string>

// OpenTime includes only
#include "opentime/rationalTime.h"
#include "opentime/timeRange.h"
#include "opentime/timeTransform.h"

using namespace opentime;

// Test functions
std::string get_version() {
    return "OTIO OpenTime Bindings 1.0";
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

EMSCRIPTEN_BINDINGS(opentime_only) {
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
} 