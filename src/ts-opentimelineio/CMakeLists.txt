if (NOT EMSCRIPTEN)
    message(FATAL_ERROR "Building opentimelineio bindings requires Emscripten to be enabled")
endif()

add_executable(opentimelineio_ts
    otio_ts_bindings.cpp otio_ts_bindings.h
    otio_error_status.cpp
)

target_link_libraries(opentimelineio_ts PUBLIC opentimelineio opentime)
target_include_directories(opentimelineio_ts
    PRIVATE "${PROJECT_SOURCE_DIR}/src"
    PRIVATE "${PROJECT_SOURCE_DIR}/src/deps"
    PRIVATE "${PROJECT_SOURCE_DIR}/src/deps/optional-lite/include"
)
set_target_properties(opentimelineio_ts PROPERTIES
    LINK_FLAGS "--bind -s MODULARIZE=1 -s EXPORT_ES6=1 -s EXPORT_NAME='OpenTimelineModule' -s EXPORTED_FUNCTIONS=['_malloc','_free'] -s ALLOW_MEMORY_GROWTH=1 -s WASM=1 -sASSERTIONS"
    OUTPUT_NAME "opentimeline"
    SUFFIX ".js")
