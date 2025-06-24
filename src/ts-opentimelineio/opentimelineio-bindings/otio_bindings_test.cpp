#ifdef EMSCRIPTEN
#include <emscripten/bind.h>
#endif

#include <string>

#ifdef EMSCRIPTEN
using namespace emscripten;

std::string test_function() {
    return "Hello from OTIO bindings";
}

EMSCRIPTEN_BINDINGS(test_module) {
    function("test_function", &test_function);
}
#endif 