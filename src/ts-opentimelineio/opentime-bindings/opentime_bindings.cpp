// SPDX-License-Identifier: Apache-2.0
// Copyright Contributors to the OpenTimelineIO project

#ifdef EMSCRIPTEN
#include <emscripten/bind.h>
#endif

#include "opentime_bindings.h"
#include "opentime/rationalTime.h"
#include "opentime/timeRange.h"
#include "opentime/timeTransform.h"

using namespace opentime;

std::string opentime_js_str(RationalTime rt) {
    return std::to_string(rt.value()) + "/" + std::to_string(rt.rate());
}

std::string opentime_js_repr(RationalTime rt) {
    return "RationalTime(" + std::to_string(rt.value()) + ", " + std::to_string(rt.rate()) + ")";
}

void opentime_rationalTime_bindings() {
#ifdef EMSCRIPTEN
    using namespace emscripten;
    
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
        ;
        
    // Operators
    function("add", select_overload<RationalTime(const RationalTime&, const RationalTime&)>(&operator+));
    function("subtract", select_overload<RationalTime(const RationalTime&, const RationalTime&)>(&operator-));
    function("multiply", select_overload<RationalTime(const RationalTime&, double)>(&operator*));
    function("divide", select_overload<RationalTime(const RationalTime&, double)>(&operator/));
    
    // Static methods
    class_<RationalTime>()
        .class_function("duration_from_start_end_time", &RationalTime::duration_from_start_end_time)
        .class_function("duration_from_start_end_time_inclusive", &RationalTime::duration_from_start_end_time_inclusive)
        .class_function("from_frames", &RationalTime::from_frames)
        .class_function("from_seconds", select_overload<RationalTime(double)>(&RationalTime::from_seconds))
        .class_function("from_seconds", select_overload<RationalTime(double, double)>(&RationalTime::from_seconds))
        .class_function("from_timecode", select_overload<RationalTime(const std::string&, double)>(&RationalTime::from_timecode));
#endif
}

void opentime_timeRange_bindings() {
#ifdef EMSCRIPTEN
    using namespace emscripten;
    
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
        .function("clamped", select_overload<TimeRange(RationalTime) const>(&TimeRange::clamped))
        .function("clamped", select_overload<TimeRange(TimeRange) const>(&TimeRange::clamped))
        .function("contains", select_overload<bool(RationalTime) const>(&TimeRange::contains))
        .function("contains", select_overload<bool(TimeRange) const>(&TimeRange::contains))
        .function("overlaps", select_overload<bool(TimeRange) const>(&TimeRange::overlaps))
        .function("intersects", &TimeRange::intersects)
        .function("intersection", &TimeRange::intersection)
        ;
        
    // Static methods
    class_<TimeRange>()
        .class_function("range_from_start_end_time", &TimeRange::range_from_start_end_time)
        .class_function("range_from_start_end_time_inclusive", &TimeRange::range_from_start_end_time_inclusive);
#endif
}

void opentime_timeTransform_bindings() {
#ifdef EMSCRIPTEN
    using namespace emscripten;
    
    class_<TimeTransform>("TimeTransform")
        .constructor<>()
        .constructor<RationalTime>()
        .constructor<RationalTime, double>()
        .constructor<RationalTime, double, RationalTime>()
        .property("offset", &TimeTransform::offset)
        .property("scale", &TimeTransform::scale)
        .property("rate", &TimeTransform::rate)
        .function("applied_to", select_overload<RationalTime(RationalTime) const>(&TimeTransform::applied_to))
        .function("applied_to", select_overload<TimeRange(TimeRange) const>(&TimeTransform::applied_to))
        ;
#endif
}

#ifdef EMSCRIPTEN
EMSCRIPTEN_BINDINGS(opentime) {
    opentime_rationalTime_bindings();
    opentime_timeRange_bindings();
    opentime_timeTransform_bindings();
}
#endif 