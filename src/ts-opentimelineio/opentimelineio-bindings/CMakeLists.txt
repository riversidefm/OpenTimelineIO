#------------------------------------------------------------------------------
# src/ts-opentimelineio/opentimelineio-bindings/CMakeLists.txt

if(EMSCRIPTEN)
    set(_OTIO_TS_HEADER_FILES
        otio_bindings.h)

    add_executable(opentimelineio_wasm
                   otio_bindings.cpp
                   ${_OTIO_TS_HEADER_FILES})

    target_include_directories(opentimelineio_wasm 
        PRIVATE "${PROJECT_SOURCE_DIR}/src"
        PRIVATE "${PROJECT_SOURCE_DIR}/src/deps"
        PRIVATE "${PROJECT_SOURCE_DIR}/src/deps/optional-lite/include"
    )

    target_link_libraries(opentimelineio_wasm PUBLIC opentimelineio opentime)

    # Embind and WASM specific settings
    set_target_properties(opentimelineio_wasm PROPERTIES
        LINK_FLAGS "--bind -s MODULARIZE=1 -s EXPORT_NAME='OpenTimelineIOModule' -s EXPORTED_FUNCTIONS=['_malloc','_free'] -s ALLOW_MEMORY_GROWTH=1 -s WASM=1 -s DISABLE_EXCEPTION_CATCHING=0"
        OUTPUT_NAME "opentimelineio"
        SUFFIX ".js")

    # Install the generated .js and .wasm files
    install(FILES 
        "${CMAKE_CURRENT_BINARY_DIR}/opentimelineio.js"
        "${CMAKE_CURRENT_BINARY_DIR}/opentimelineio.wasm"
        DESTINATION "${OTIO_RESOLVED_TYPESCRIPT_INSTALL_DIR}")

endif() 