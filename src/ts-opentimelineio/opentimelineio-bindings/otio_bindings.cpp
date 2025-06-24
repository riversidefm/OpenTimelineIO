// SPDX-License-Identifier: Apache-2.0
// Copyright Contributors to the OpenTimelineIO project

#ifdef EMSCRIPTEN
#include <emscripten/bind.h>
#endif

#include "otio_bindings.h"
#include "opentimelineio/serialization.h"
#include "opentimelineio/deserialization.h"

#ifdef EMSCRIPTEN
using namespace emscripten;

std::string serialize_json_to_string_ts(val any_obj, int indent) {
    // This is a simplified version - in a full implementation you'd need
    // to convert the JavaScript object to the appropriate C++ type
    // For now, we'll assume the object is already a SerializableObject*
    return "{}"; // Placeholder
}

val deserialize_json_from_string_ts(const std::string& input) {
    // Simplified placeholder implementation
    return val::object();
}

EMSCRIPTEN_BINDINGS(otio_core) {
    // Core serialization functions
    function("serialize_json_to_string", &serialize_json_to_string_ts);
    function("deserialize_json_from_string", &deserialize_json_from_string_ts);
    
    // Call the serializable object bindings
    otio_serializable_object_bindings();
}
#endif 