#include <emscripten/bind.h>
#include <string>

std::string hello_world() {
    return "Hello from minimal OTIO test";
}

EMSCRIPTEN_BINDINGS(minimal_test) {
    emscripten::function("hello_world", &hello_world);
} 