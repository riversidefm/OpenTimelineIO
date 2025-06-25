#------------------------------------------------------------------------------
# src/ts-opentimelineio/opentimelineio-bindings/CMakeLists.txt

if(EMSCRIPTEN)
    set(_OTIO_TS_HEADER_FILES
        otio_bindings.h)

    add_executable(opentimelineio_wasm
                   simple_working_test.cpp
                   ${_OTIO_TS_HEADER_FILES})

    target_include_directories(opentimelineio_wasm 
        PRIVATE "${PROJECT_SOURCE_DIR}/src"
        PRIVATE "${PROJECT_SOURCE_DIR}/src/deps"
        PRIVATE "${PROJECT_SOURCE_DIR}/src/deps/optional-lite/include"
    )

    target_link_libraries(opentimelineio_wasm PUBLIC opentime)

    # Embind and WASM specific settings
    set_target_properties(opentimelineio_wasm PROPERTIES
        LINK_FLAGS "--bind -s MODULARIZE=1 -s EXPORT_NAME='OpenTimelineIOModule' -s EXPORTED_FUNCTIONS=['_malloc','_free'] -s ALLOW_MEMORY_GROWTH=1 -s WASM=1"
        OUTPUT_NAME "opentimelineio"
        SUFFIX ".js")

    # Install the generated .js and .wasm files
    install(FILES 
        "${CMAKE_CURRENT_BINARY_DIR}/opentimelineio.js"
        "${CMAKE_CURRENT_BINARY_DIR}/opentimelineio.wasm"
        DESTINATION "${OTIO_RESOLVED_TYPESCRIPT_INSTALL_DIR}")

endif()

# OTIO TypeScript/JS Bindings
set(otio_ts_bindings_SOURCES
    opentime_only_bindings.cpp
)

# Create the bindings library
add_executable(otio_ts_bindings ${otio_ts_bindings_SOURCES})

# Include headers the same way as Python bindings
target_include_directories(otio_ts_bindings PRIVATE
    "${PROJECT_SOURCE_DIR}/src"
    "${PROJECT_SOURCE_DIR}/src/deps"
    "${PROJECT_SOURCE_DIR}/src/deps/optional-lite/include"
)

# Link required libraries - OpenTime only (avoiding std::any issues)
target_link_libraries(otio_ts_bindings 
    PUBLIC 
        opentime
)

# Emscripten compile flags
set_target_properties(otio_ts_bindings PROPERTIES
    OUTPUT_NAME "otio"
    CXX_STANDARD 14 
    COMPILE_FLAGS "-fPIC"
    LINK_FLAGS "--bind -s MODULARIZE=1 -s EXPORT_NAME='OTIO' -s EXPORT_ES6=1 -s USE_ES6_IMPORT_META=1 -s ALLOW_MEMORY_GROWTH=1 -s ENVIRONMENT=web,worker"
) 