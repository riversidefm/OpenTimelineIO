# Calculate relative path from project root to build directory
file(RELATIVE_PATH CMAKE_BINARY_DIR_RELATIVE
     "${CMAKE_SOURCE_DIR}"
     "${CMAKE_BINARY_DIR}")

# Generate module-loader.ts from template with correct path to built JS file
configure_file(
    "${CMAKE_CURRENT_SOURCE_DIR}/helpers/module-loader.ts.in"
    "${CMAKE_CURRENT_SOURCE_DIR}/helpers/module-loader.ts"
    @ONLY
)

# Copy the generated .d.ts file to tests-web for TypeScript compilation
add_custom_command(
    OUTPUT "${CMAKE_CURRENT_SOURCE_DIR}/types/opentimeline.d.ts"
    COMMAND ${CMAKE_COMMAND} -E make_directory "${CMAKE_CURRENT_SOURCE_DIR}/types"
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        "${CMAKE_BINARY_DIR}/src/ts-opentimelineio/opentimeline.d.ts"
        "${CMAKE_CURRENT_SOURCE_DIR}/types/opentimeline.d.ts"
    DEPENDS opentimelineio_ts
    COMMENT "Copying TypeScript declarations for tests"
)

add_custom_target(copy_types ALL
    DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/types/opentimeline.d.ts"
)
