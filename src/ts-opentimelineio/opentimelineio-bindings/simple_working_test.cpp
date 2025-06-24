#include <emscripten/bind.h>
#include <string>

std::string get_version() {
    return "OTIO Test 1.0";
}

void test_connection() {
    // Simple test function
}

EMSCRIPTEN_BINDINGS(simple_test) {
    emscripten::function("get_version", &get_version);
    emscripten::function("test_connection", &test_connection);
} 