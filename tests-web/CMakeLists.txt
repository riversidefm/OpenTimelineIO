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
