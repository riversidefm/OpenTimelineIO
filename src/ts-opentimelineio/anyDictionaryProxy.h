#include <opentimelineio/anyDictionary.h>

namespace otio = opentimelineio::OPENTIMELINEIO_VERSION;

class AnyDictionaryProxyTS {
public:
    AnyDictionaryProxyTS() =delete;
    AnyDictionaryProxyTS(otio::AnyDictionary::MutationStamp* stamp) : _stamp(stamp) {}
    ~AnyDictionaryProxyTS() =default;

    bool has_key(const std::string& key) const {
        if (_stamp->any_dictionary) {
            return _stamp->any_dictionary->has_key(key);
        }
        return false;
    }

    void set_string(const std::string& key, const std::string& value) {
        if (_stamp->any_dictionary) {
            _stamp->any_dictionary->operator[](key) = value;
        }
    }

    std::string get_string(const std::string& key) const {
        if (_stamp->any_dictionary) {
            return std::any_cast<std::string>(_stamp->any_dictionary->at(key));
        }
        return "";
    }

    void set_bool(const std::string& key, bool value) {
        if (_stamp->any_dictionary) {
            _stamp->any_dictionary->operator[](key) = value;
        }
    }

    bool get_bool(const std::string& key) const {
        if (_stamp->any_dictionary) {
            return std::any_cast<bool>(_stamp->any_dictionary->at(key));
        }
        return false;
    }

    void set_number(const std::string& key, double value) {
        if (_stamp->any_dictionary) {
            _stamp->any_dictionary->operator[](key) = value;
        }
    }

    double get_number(const std::string& key) const {
        if (_stamp->any_dictionary) {
            return std::any_cast<double>(_stamp->any_dictionary->at(key));
        }
        return 0.0;
    }

    void set_integer(const std::string& key, int64_t value) {
        if (_stamp->any_dictionary) {
            _stamp->any_dictionary->operator[](key) = value;
        }
    }

    int64_t get_integer(const std::string& key) const {
        if (_stamp->any_dictionary) {
            return std::any_cast<int64_t>(_stamp->any_dictionary->at(key));
        }
        return 0;
    }

protected:
    otio::AnyDictionary::MutationStamp* _stamp;
};