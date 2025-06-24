#------------------------------------------------------------------------------
# src/ts-opentimelineio/CMakeLists.txt

# Only build TypeScript bindings when using Emscripten
if(EMSCRIPTEN)
    message(STATUS "Building TypeScript/WASM bindings")
    
    add_subdirectory(opentime-bindings)
    add_subdirectory(opentimelineio-bindings)
    
    # TypeScript definition files and JavaScript wrapper
    if(OTIO_INSTALL_TYPESCRIPT_MODULES)
        install(DIRECTORY "${PROJECT_SOURCE_DIR}/src/ts-opentimelineio/typescript/"
            DESTINATION "${OTIO_RESOLVED_TYPESCRIPT_INSTALL_DIR}")
    endif()
    
else()
    message(STATUS "Skipping TypeScript bindings (not using Emscripten)")
endif() 