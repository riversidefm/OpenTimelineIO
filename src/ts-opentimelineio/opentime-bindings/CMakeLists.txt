
add_executable(opentime_wasm opentime_bindings.cpp)

target_link_libraries(opentime_wasm PUBLIC opentimelineio opentime)

target_include_directories(opentime_wasm 
    PRIVATE "${PROJECT_SOURCE_DIR}/src"
    PRIVATE "${PROJECT_SOURCE_DIR}/src/deps"
    PRIVATE "${PROJECT_SOURCE_DIR}/src/deps/optional-lite/include")

set_target_properties(opentime_wasm PROPERTIES
    LINK_FLAGS "--bind -s MODULARIZE=1 -s EXPORT_NAME='OpenTimeModule' -s EXPORTED_FUNCTIONS=['_malloc','_free'] -s ALLOW_MEMORY_GROWTH=1 -s WASM=1"
    OUTPUT_NAME "opentime"
    SUFFIX ".js")

# Install the generated .js and .wasm files
install(FILES 
    "${CMAKE_CURRENT_BINARY_DIR}/opentime.js"
    "${CMAKE_CURRENT_BINARY_DIR}/opentime.wasm"
    DESTINATION "${OTIO_RESOLVED_TYPESCRIPT_INSTALL_DIR}")