#pragma once
#include <emscripten/bind.h>

#include <opentimelineio/composable.h>
#include <opentimelineio/composition.h>
#include <opentimelineio/effect.h>
#include <opentimelineio/item.h>
#include <opentimelineio/marker.h>
#include <opentimelineio/serializableObject.h>
#include <opentimelineio/serializableObjectWithMetadata.h>

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