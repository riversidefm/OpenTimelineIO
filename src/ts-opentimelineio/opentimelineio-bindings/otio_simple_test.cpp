#ifdef EMSCRIPTEN
#include <emscripten/bind.h>
#endif

#include <string>

std::string get_otio_version() {
    return "OTIO Test Version 1.0";
}

void simple_otio_bindings() {
#ifdef EMSCRIPTEN
    using namespace emscripten;
    
    function("get_otio_version", &get_otio_version);
#endif
}

#ifdef EMSCRIPTEN
EMSCRIPTEN_BINDINGS(otio_simple) {
    simple_otio_bindings();
}
#endif 