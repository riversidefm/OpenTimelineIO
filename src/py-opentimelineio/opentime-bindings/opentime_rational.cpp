#include <pybind11/operators.h>
#include <pybind11/pybind11.h>

#include "opentime/rational.h"

#include <sstream>

namespace py = pybind11;
using namespace opentime;

static Rational to_rational(py::object obj) {
    if (py::isinstance<py::int_>(obj)) {
        return Rational(obj.cast<int>());
    } else if (py::isinstance<py::str>(obj)) {
        Rational r;
        return r.from_string(obj.cast<std::string>());
    } else if (py::hasattr(obj, "numerator") && py::hasattr(obj, "denominator")) {
        return Rational(obj.attr("numerator").cast<int>(), obj.attr("denominator").cast<int>());
    } else {
        throw std::invalid_argument("Cannot convert to Fraction");
    }
}

static py::object from_rational(const Rational& r) {
    py::module_ fractions = py::module_::import("fractions");
    return fractions.attr("Fraction")(r.numerator(), r.denominator());
}

namespace pybind11 { namespace detail {

template <> struct type_caster<Rational> {
public:
    PYBIND11_TYPE_CASTER(Rational, _("Rational"));

    // Python -> C++
    bool load(handle src, bool) {
        try {
            value = to_rational(py::reinterpret_borrow<py::object>(src));
            return true;
        } catch (...) {
            return false;
        }
    }

    // C++ -> Python
    static handle cast(const Rational& src, return_value_policy, handle) {
        return from_rational(src).release();
    }
};

}} // namespace pybind11::detail