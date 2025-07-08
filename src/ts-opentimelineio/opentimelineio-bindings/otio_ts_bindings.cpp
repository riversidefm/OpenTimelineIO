#include <emscripten/bind.h>

#include <opentimelineio/composable.h>
#include <opentimelineio/composition.h>
#include <opentimelineio/item.h>
#include <opentimelineio/marker.h>
#include <opentimelineio/serializableObject.h>
#include <opentimelineio/serializableObjectWithMetadata.h>

namespace otio = opentimelineio::OPENTIMELINEIO_VERSION;
namespace ot = opentime::OPENTIME_VERSION;
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

} // anonymous namespace

EMSCRIPTEN_BINDINGS(opentimelineio) {
    emscripten::register_map<std::string, int64_t>("StringInt64Map");

    emscripten::class_<otio::ErrorStatus>("ErrorStatus")
        .function("outcome_to_string", &otio::ErrorStatus::outcome_to_string, emscripten::allow_raw_pointers())
    ;

    emscripten::class_<otio::SerializableObject>("SerializableObject")
        .smart_ptr_constructor("SerializableObject", &create_serializable_object)
        .function("to_json_string", &serializable_object_to_json_string, emscripten::allow_raw_pointers())
        .class_function("from_json_string", &otio::SerializableObject::from_json_string, emscripten::allow_raw_pointers())
    ;

    emscripten::class_<otio::SerializableObjectWithMetadata, emscripten::base<otio::SerializableObject>>("SerializableObjectWithMetadata")
        .smart_ptr_constructor("SerializableObjectWithMetadata", &create_serializable_object_with_metadata)
        .property("name", &otio::SerializableObjectWithMetadata::name, &otio::SerializableObjectWithMetadata::set_name)
    ;

    emscripten::class_<otio::Composable, emscripten::base<otio::SerializableObjectWithMetadata>>("Composable")
        .smart_ptr_constructor("Composable", &create_composable)
        .function("visible", &otio::Composable::visible)
        .function("overlapping", &otio::Composable::overlapping)
    ;

    emscripten::class_<otio::Item, emscripten::base<otio::Composable>>("Item")
        .smart_ptr_constructor("Item", &create_item)
        .property("enabled", &otio::Item::enabled, &otio::Item::set_enabled)
        .function("visible", &otio::Item::visible)
        .function("overlapping", &otio::Item::overlapping)
    ;

    emscripten::class_<otio::Composition, emscripten::base<otio::Item>>("Composition")
        .smart_ptr_constructor("Composition", &create_composition)
        .function("composition_kind", &otio::Composition::composition_kind)
    ;

    emscripten::class_<otio::Marker, emscripten::base<otio::SerializableObjectWithMetadata>>("Marker")
        .smart_ptr_constructor("Marker", &create_marker)
        .property("color", &otio::Marker::color, &otio::Marker::set_color)
        .property("comment", &otio::Marker::comment, &otio::Marker::set_comment)
    ;
}

