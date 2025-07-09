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

protected:
    otio::AnyDictionary::MutationStamp* _stamp;
};