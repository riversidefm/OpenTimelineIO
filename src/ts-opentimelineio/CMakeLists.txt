if (NOT EMSCRIPTEN)
    message(FATAL_ERROR "Building opentimelineio bindings requires Emscripten to be enabled")
endif()

add_executable(opentimelineio_ts
    otio_error_status.cpp
    otio_ts_bindings.cpp otio_ts_bindings.h
)

target_link_libraries(opentimelineio_ts PUBLIC opentimelineio opentime)
target_include_directories(opentimelineio_ts
    PRIVATE "${PROJECT_SOURCE_DIR}/src"
    PRIVATE "${PROJECT_SOURCE_DIR}/src/deps"
    PRIVATE "${PROJECT_SOURCE_DIR}/src/deps/optional-lite/include"
)
target_compile_options(opentimelineio_ts PUBLIC -fwasm-exceptions)

set(LINK_FLAGS
    "--bind"
    "-sMODULARIZE=1"
    "-sEXPORT_ES6=1"
    "-sEXPORT_NAME='OpenTimelineModule'"
    "-sEXPORTED_FUNCTIONS=['_malloc','_free']"
    "-sALLOW_MEMORY_GROWTH=1"
    "-sWASM=1"
    "-fwasm-exceptions"
    "-sEXPORT_EXCEPTION_HANDLING_HELPERS")

set_target_properties(opentimelineio_ts PROPERTIES
    LINK_FLAGS ${LINK_FLAGS}
    OUTPUT_NAME "opentimeline"
    SUFFIX ".mjs")

# Generate package.json with correct paths to built files
set(OPENTIMELINE_PACKAGE_VERSION "1.0.0")

file(GENERATE
    OUTPUT "${CMAKE_CURRENT_BINARY_DIR}/package.json"
    CONTENT "{
    \"name\": \"@riversidefm/opentimeline\",
    \"version\": \"${OPENTIMELINE_PACKAGE_VERSION}\",
    \"type\": \"module\",
    \"main\": \"$<TARGET_FILE_NAME:opentimelineio_ts>\",
    \"files\": [
        \"$<TARGET_FILE_NAME:opentimelineio_ts>\",
        \"$<TARGET_FILE_BASE_NAME:opentimelineio_ts>.wasm\"
    ]
}")

# Create npm package target
add_custom_target(opentimelineio_npm_package
    COMMAND npm pack
    WORKING_DIRECTORY "${CMAKE_CURRENT_BINARY_DIR}"
    DEPENDS opentimelineio_ts "${CMAKE_CURRENT_BINARY_DIR}/package.json"
    COMMENT "Creating npm package for OpenTimelineIO TypeScript bindings"
)
