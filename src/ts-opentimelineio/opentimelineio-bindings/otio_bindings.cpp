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

// Simple demonstration functions
std::string get_version() {
    return "OpenTimelineIO 0.18.0 (TypeScript Bindings)";
}

bool test_connection() {
    return true;
}

EMSCRIPTEN_BINDINGS(otio_core) {
    // Simple test functions
    function("get_version", &get_version);
    function("test_connection", &test_connection);
    
    // Call the serializable object bindings (commented out for now due to protected destructors)
    // otio_serializable_object_bindings();
}
#endif 