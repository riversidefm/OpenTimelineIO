add_executable(opentimelineio_wasm opentimelineio_bindings.cpp)

target_link_libraries(opentimelineio_wasm PUBLIC opentime)

set_target_properties(opentimelineio_wasm PROPERTIES
    LINK_FLAGS "--bind -s MODULARIZE=1 -s EXPORT_NAME='OpenTimelineIOModule' -s EXPORTED_FUNCTIONS=['_malloc','_free'] -s ALLOW_MEMORY_GROWTH=1 -s WASM=1"
    OUTPUT_NAME "opentimelineio"
    SUFFIX ".js")

# Install the generated .js and .wasm files
install(FILES 
    "${CMAKE_CURRENT_BINARY_DIR}/opentimelineio.js"
    "${CMAKE_CURRENT_BINARY_DIR}/opentimelineio.wasm"
    DESTINATION "${OTIO_RESOLVED_TYPESCRIPT_INSTALL_DIR}")