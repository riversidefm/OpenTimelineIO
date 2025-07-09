#include <emscripten/bind.h>

#include <opentimelineio/composable.h>
#include <opentimelineio/composition.h>
#include <opentimelineio/effect.h>
#include <opentimelineio/item.h>
#include <opentimelineio/marker.h>
#include <opentimelineio/serializableObject.h>
#include <opentimelineio/serializableObjectWithMetadata.h>

#include <Imath/ImathBox.h>

#include "anyDictionaryProxy.h"

namespace otio = opentimelineio::OPENTIMELINEIO_VERSION;
namespace ot = opentime::OPENTIME_VERSION;
namespace em = emscripten;

template<typename T>
using Retainer = otio::SerializableObject::Retainer<T>;

namespace emscripten {

// All open timeline objects are held within the Retainer<> class, which is a smart pointer.
template<typename T>
struct smart_ptr_trait<Retainer<T>> {
    using pointer_type = Retainer<T>;
    using element_type = T;

    static T* get(const pointer_type& ptr) {
        return ptr.value;
    }

    static sharing_policy get_sharing_policy() {
        return sharing_policy::INTRUSIVE;
    }

    static pointer_type share(const pointer_type &r, T *ptr) {
        return pointer_type(ptr);
    }

    static pointer_type *construct_null() {
        return new pointer_type;
    }
};

namespace internal {

// All objects should be managed by Retainer<> smart pointers.  Because the destructors are protected,
// we need to delete the raw_destructor (which shouldn't be called anyway).

template<>
void raw_destructor<otio::SerializableObject>(otio::SerializableObject* ptr) {}

template<>
void raw_destructor<otio::SerializableObjectWithMetadata>(otio::SerializableObjectWithMetadata* ptr) {}

template<>
void raw_destructor<otio::Composable>(otio::Composable* ptr) {}

template<>
void raw_destructor<otio::Item>(otio::Item* ptr) {}

template<>
void raw_destructor<otio::Composition>(otio::Composition* ptr) {}

template<>
void raw_destructor<otio::Marker>(otio::Marker* ptr) {}


} // namespace internal

} // namespace emscripten

namespace {

// Factory functions for Retainer held SerializableObjects
Retainer<otio::SerializableObject> create_serializable_object() {
    return Retainer<otio::SerializableObject>(new otio::SerializableObject());
}

std::string serializable_object_to_json_string(otio::SerializableObject const& self) {
    return self.to_json_string();
}

Retainer<otio::SerializableObjectWithMetadata> create_serializable_object_with_metadata(std::string const& name = std::string()) {
    return otio::SerializableObjectWithMetadata::Retainer<otio::SerializableObjectWithMetadata>(new otio::SerializableObjectWithMetadata(name));
}

Retainer<otio::Composable> create_composable(std::string const& name = std::string()) {
    return otio::Composable::Retainer<otio::Composable>(new otio::Composable(name));
}

Retainer<otio::Item> create_item(std::string const& name = std::string()) {
    return otio::Item::Retainer<otio::Item>(new otio::Item(name));
}

Retainer<otio::Composition> create_composition(std::string const& name = std::string()) {
    return otio::Composition::Retainer<otio::Composition>(new otio::Composition(name));
}

Retainer<otio::Marker> create_marker(std::string const& name = std::string(), std::string const& color = std::string(), std::string const& comment = std::string()) {
    return otio::Marker::Retainer<otio::Marker>(new otio::Marker(name, ot::TimeRange(), color, otio::AnyDictionary(), comment));
}

// Accessor functions
AnyDictionaryProxyTS get_metadata(otio::SerializableObjectWithMetadata& self) {
    return AnyDictionaryProxyTS(self.metadata().get_or_create_mutation_stamp());
}

std::optional<IMATH_NAMESPACE::Box2d> get_available_image_bounds(otio::Composable& self) {
    return self.available_image_bounds(nullptr);
}

} // anonymous namespace

EMSCRIPTEN_BINDINGS(opentimeline) {
    // Register types
    em::register_map<std::string, int64_t>("StringInt64Map");
    em::register_vector<Retainer<otio::Marker>>("VectorMarker");
    em::register_vector<Retainer<otio::Effect>>("VectorEffect");
    em::register_optional<ot::TimeRange>();
    em::register_optional<IMATH_NAMESPACE::Box2d>();

    // AnyDictionaryProxy bindings
    em::class_<AnyDictionaryProxyTS>("AnyDictionary")
        .function("has_key", &AnyDictionaryProxyTS::has_key)
        .function("set_string", &AnyDictionaryProxyTS::set_string)
        .function("get_string", &AnyDictionaryProxyTS::get_string)
        .function("set_bool", &AnyDictionaryProxyTS::set_bool)
        .function("get_bool", &AnyDictionaryProxyTS::get_bool)
    ;

    // IMath bindings
    em::class_<IMATH_NAMESPACE::V2d>("V2d")
        .constructor<double, double>()
        .property("x", &IMATH_NAMESPACE::V2d::x)
        .property("y", &IMATH_NAMESPACE::V2d::y)
    ;

    em::class_<IMATH_NAMESPACE::Box2d>("Box2d")
        .constructor<IMATH_NAMESPACE::V2d, IMATH_NAMESPACE::V2d>()
        .property("min", &IMATH_NAMESPACE::Box2d::min)
        .property("max", &IMATH_NAMESPACE::Box2d::max)
    ;

    // OpenTime bindings
    em::class_<ot::RationalTime>("RationalTime")
        .constructor<double, double>()
        .function("is_invalid_time", &ot::RationalTime::is_invalid_time)
        .function("is_valid_time", &ot::RationalTime::is_valid_time)
        .property("value", &ot::RationalTime::value)
        .property("rate", &ot::RationalTime::rate)
        .class_function("from_seconds", em::select_overload<ot::RationalTime(double)>(&ot::RationalTime::from_seconds))
        .class_function("from_seconds_rate", em::select_overload<ot::RationalTime(double, double)>(&ot::RationalTime::from_seconds))
    ;

    em::class_<ot::TimeRange>("TimeRange")
        .constructor<ot::RationalTime>()
        .constructor<ot::RationalTime, ot::RationalTime>()
        .constructor<double, double, double>()
        .function("is_invalid_range", &ot::TimeRange::is_invalid_range)
        .function("is_valid_range", &ot::TimeRange::is_valid_range)
        .property("start_time", &ot::TimeRange::start_time)
        .property("duration", &ot::TimeRange::duration)
        .property("end_time_inclusive", &ot::TimeRange::end_time_inclusive)
        .property("end_time_exclusive", &ot::TimeRange::end_time_exclusive)
    ;

    // OpenTimelineIO bindings

    em::class_<otio::ErrorStatus>("ErrorStatus")
        .constructor()
        .function("outcome_to_string", &otio::ErrorStatus::outcome_to_string, em::allow_raw_pointers())
        .property("outcome", &otio::ErrorStatus::outcome)
        .property("details", &otio::ErrorStatus::details)
    ;

    em::enum_<otio::ErrorStatus::Outcome>("ErrorStatusOutcome")
        .value("OK", otio::ErrorStatus::OK)
        .value("NOT_IMPLEMENTED", otio::ErrorStatus::NOT_IMPLEMENTED)
        .value("UNRESOLVED_OBJECT_REFERENCE", otio::ErrorStatus::UNRESOLVED_OBJECT_REFERENCE)
        .value("DUPLICATE_OBJECT_REFERENCE", otio::ErrorStatus::DUPLICATE_OBJECT_REFERENCE)
        .value("MALFORMED_SCHEMA", otio::ErrorStatus::MALFORMED_SCHEMA)
        .value("JSON_PARSE_ERROR", otio::ErrorStatus::JSON_PARSE_ERROR)
        .value("CHILD_ALREADY_PARENTED", otio::ErrorStatus::CHILD_ALREADY_PARENTED)
        .value("FILE_OPEN_FAILED", otio::ErrorStatus::FILE_OPEN_FAILED)
        .value("FILE_WRITE_FAILED", otio::ErrorStatus::FILE_WRITE_FAILED)
        .value("SCHEMA_ALREADY_REGISTERED", otio::ErrorStatus::SCHEMA_ALREADY_REGISTERED)
        .value("SCHEMA_NOT_REGISTERED", otio::ErrorStatus::SCHEMA_NOT_REGISTERED)
        .value("SCHEMA_VERSION_UNSUPPORTED", otio::ErrorStatus::SCHEMA_VERSION_UNSUPPORTED)
        .value("KEY_NOT_FOUND", otio::ErrorStatus::KEY_NOT_FOUND)
        .value("ILLEGAL_INDEX", otio::ErrorStatus::ILLEGAL_INDEX)
        .value("TYPE_MISMATCH", otio::ErrorStatus::TYPE_MISMATCH)
        .value("INTERNAL_ERROR", otio::ErrorStatus::INTERNAL_ERROR)
        .value("NOT_AN_ITEM", otio::ErrorStatus::NOT_AN_ITEM)
        .value("NOT_A_CHILD_OF", otio::ErrorStatus::NOT_A_CHILD_OF)
        .value("NOT_A_CHILD", otio::ErrorStatus::NOT_A_CHILD)
        .value("NOT_DESCENDED_FROM", otio::ErrorStatus::NOT_DESCENDED_FROM)
        .value("CANNOT_COMPUTE_AVAILABLE_RANGE", otio::ErrorStatus::CANNOT_COMPUTE_AVAILABLE_RANGE)
        .value("INVALID_TIME_RANGE", otio::ErrorStatus::INVALID_TIME_RANGE)
        .value("OBJECT_WITHOUT_DURATION", otio::ErrorStatus::OBJECT_WITHOUT_DURATION)
        .value("CANNOT_TRIM_TRANSITION", otio::ErrorStatus::CANNOT_TRIM_TRANSITION)
        .value("OBJECT_CYCLE", otio::ErrorStatus::OBJECT_CYCLE)
        .value("CANNOT_COMPUTE_BOUNDS", otio::ErrorStatus::CANNOT_COMPUTE_BOUNDS)
        .value("MEDIA_REFERENCES_DO_NOT_CONTAIN_ACTIVE_KEY", otio::ErrorStatus::MEDIA_REFERENCES_DO_NOT_CONTAIN_ACTIVE_KEY)
        .value("MEDIA_REFERENCES_CONTAIN_EMPTY_KEY", otio::ErrorStatus::MEDIA_REFERENCES_CONTAIN_EMPTY_KEY)
        .value("NOT_A_GAP", otio::ErrorStatus::NOT_A_GAP)
    ;

    em::class_<otio::SerializableObject>("SerializableObject")
        .smart_ptr_constructor("SerializableObject", &create_serializable_object)
        .function("to_json_string", &serializable_object_to_json_string, em::allow_raw_pointers())
        .class_function("from_json_string", &otio::SerializableObject::from_json_string, em::allow_raw_pointers())
    ;

    em::class_<otio::SerializableObjectWithMetadata, em::base<otio::SerializableObject>>("SerializableObjectWithMetadata")
        .smart_ptr_constructor("SerializableObjectWithMetadata", &create_serializable_object_with_metadata)
        .property("name", &otio::SerializableObjectWithMetadata::name, &otio::SerializableObjectWithMetadata::set_name)
        .function("metadata", &get_metadata)
    ;

    em::class_<otio::Composable, em::base<otio::SerializableObjectWithMetadata>>("Composable")
        .smart_ptr_constructor("Composable", &create_composable)
        .function("visible", &otio::Composable::visible)
        .function("overlapping", &otio::Composable::overlapping)
        .function("parent", &otio::Composable::parent, em::allow_raw_pointers())
        .function("available_image_bounds", &get_available_image_bounds)
    ;

    em::class_<otio::Item, em::base<otio::Composable>>("Item")
        .smart_ptr_constructor("Item", &create_item)
        .property("enabled", &otio::Item::enabled, &otio::Item::set_enabled)
        .function("visible", &otio::Item::visible)
        .function("overlapping", &otio::Item::overlapping)
        .property("source_range", &otio::Item::source_range, &otio::Item::set_source_range)
        .function("markers", em::select_overload<std::vector<Retainer<otio::Marker>>& ()>(&otio::Item::markers), em::return_value_policy::reference() )
    ;

    em::class_<otio::Composition, em::base<otio::Item>>("Composition")
        .smart_ptr_constructor("Composition", &create_composition)
        .function("composition_kind", &otio::Composition::composition_kind)
    ;

    em::class_<otio::Marker, em::base<otio::SerializableObjectWithMetadata>>("Marker")
        .smart_ptr_constructor("Marker", &create_marker)
        .property("color", &otio::Marker::color, &otio::Marker::set_color)
        .property("comment", &otio::Marker::comment, &otio::Marker::set_comment)
        .property("marked_range", &otio::Marker::marked_range, &otio::Marker::set_marked_range)
    ;
}

