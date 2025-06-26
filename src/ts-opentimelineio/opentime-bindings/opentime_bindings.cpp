#include <emscripten/bind.h>
#include "opentime/rationalTime.h"
#include "opentime/timeRange.h"

using namespace emscripten;
namespace otio = opentime::OPENTIME_VERSION;

namespace {

    bool rt_eq(const otio::RationalTime& a, const otio::RationalTime& b) {
        return a == b;
    }
    bool rt_lt(const otio::RationalTime& a, const otio::RationalTime& b) {
        return a < b;
    }
    bool rt_lte(const otio::RationalTime& a, const otio::RationalTime& b) {
        return a <= b;
    }
    bool rt_gt(const otio::RationalTime& a, const otio::RationalTime& b) {
        return a > b;
    }
    bool rt_gte(const otio::RationalTime& a, const otio::RationalTime& b) {
        return a >= b;
    }
    
    otio::RationalTime *rt_rescaled_to(const otio::RationalTime& a, double b) {
        return new otio::RationalTime(a.rescaled_to(b));
    }

    otio::RationalTime *rt_from_timecode(const std::string& timecode, double rate) {
        return new otio::RationalTime(otio::RationalTime::from_timecode(timecode, rate));
    }

    std::string rt_to_timecode(const otio::RationalTime& a) {
        return a.to_timecode();
    }
} // anonymous namespace

EMSCRIPTEN_BINDINGS(opentime) {
    class_<otio::RationalTime>("RationalTime")
        .constructor<>()
        .constructor<double>()
        .constructor<double, double>()
        .function("value", &otio::RationalTime::value)
        .function("rate", &otio::RationalTime::rate)
        .function("is_invalid_time", &otio::RationalTime::is_invalid_time)
        .function("is_valid_time", &otio::RationalTime::is_valid_time)
        .function("equals", &rt_eq)
        .function("strictly_equal", &otio::RationalTime::strictly_equal)
        .function("less_than", &rt_lt)
        .function("less_than_or_equal", &rt_lte)
        .function("greater_than", &rt_gt)
        .function("greater_than_or_equal", &rt_gte)
        .function("floor", &otio::RationalTime::floor)
        .function("ceil", &otio::RationalTime::ceil)
        .function("round", &otio::RationalTime::round)
        .function("rescaled_to", &rt_rescaled_to, allow_raw_pointers())
        .class_function("from_timecode", &rt_from_timecode, allow_raw_pointers())
        .function("to_timecode", &rt_to_timecode)
        ; 

    class_<otio::TimeRange>("TimeRange")
        .constructor<>()
        .constructor<otio::RationalTime>()
        .constructor<otio::RationalTime, otio::RationalTime>()
        .constructor<double, double, double>()
        .function("is_invalid_range", &otio::TimeRange::is_invalid_range)
        .function("is_valid_range", &otio::TimeRange::is_valid_range)
        .function("start_time", &otio::TimeRange::start_time)
        .function("duration", &otio::TimeRange::duration)
        .function("end_time_inclusive", &otio::TimeRange::end_time_inclusive)
        ;
}