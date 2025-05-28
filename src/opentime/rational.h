#pragma once

#include "opentime/errorStatus.h"
#include "opentime/version.h"

#include <iostream>
#include <numeric>
#include <sstream>
#include <stdexcept>

namespace opentime { namespace OPENTIME_VERSION {

class Rational {
public:
    explicit constexpr Rational(int numerator = 0, int denominator = 1)
        : _numerator(numerator), _denominator(denominator) {
        if (_denominator == 0) {
            throw std::invalid_argument("Denominator cannot be zero");
        }
        normalize();
    }

    int numerator() const { return _numerator; }
    int denominator() const { return _denominator; }

    Rational operator+(const Rational& other) const {
        int num = _numerator * other._denominator + other._numerator * _denominator;
        int den = _denominator * other._denominator;
        return Rational(num, den);
    }

    Rational operator-(const Rational& other) const {
        int num = _numerator * other._denominator - other._numerator * _denominator;
        int den = _denominator * other._denominator;
        return Rational(num, den);
    }

    Rational operator*(const Rational& other) const {
        return Rational(_numerator * other._numerator, _denominator * other._denominator);
    }

    Rational operator/(const Rational& other) const {
        if (other._numerator == 0) {
            throw std::invalid_argument("Division by zero");
        }
        return Rational(_numerator * other._denominator, _denominator * other._numerator);
    }

    bool operator==(const Rational& other) const {
        return _numerator == other._numerator && _denominator == other._denominator;
    }

    bool operator!=(const Rational& other) const {
        return !(*this == other);
    }

    Rational& from_string(const std::string& str) {
        std::istringstream ss(str);
        ss >> *this;
        return *this;
    }

    friend std::ostream& operator<<(std::ostream& os, const Rational& r) {
        os << r._numerator << "/" << r._denominator;
        return os;
    }

    friend std::istream& operator>>(std::istream& is, Rational& r) {
        // Skip whitespace and parse numerator
        is >> std::ws >> r._numerator;
        // Expect and consume a slash
        char slash;
        is >> std::ws >> slash;
        if (slash != '/') {
            is.setstate(std::ios::failbit);
            return is;
        }
        // Parse denominator
        is >> std::ws >> r._denominator;
        is >> r._numerator >> slash >> r._denominator;
        if (r._denominator == 0) {
            throw std::invalid_argument("Denominator cannot be zero");
        }
        r.normalize();
        return is;
    }

private:
    int _numerator;
    int _denominator;

    constexpr void normalize() {
        int gcd = std::gcd(_numerator, _denominator);
        if (gcd != 0) {
            _numerator /= gcd;
            _denominator /= gcd;
        }
        // Ensure denominator is always positive
        if (_denominator < 0) {
            _numerator = -_numerator;
            _denominator = -_denominator;
        }
    }

};

}} // namespace opentime::OPENTIME_VERSION