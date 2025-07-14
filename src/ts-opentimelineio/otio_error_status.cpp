#include "opentimelineio/errorStatus.h"
#include "emscripten/bind.h"

namespace otio = opentimelineio::OPENTIMELINEIO_VERSION;
namespace em = emscripten;

EMSCRIPTEN_BINDINGS(otio_error_status) {

    em::class_<otio::ErrorStatus>("ErrorStatus")
        .constructor()
        .class_function("outcome_to_string", &otio::ErrorStatus::outcome_to_string, em::allow_raw_pointers())
        .property("outcome", &otio::ErrorStatus::outcome)
        .property("details", &otio::ErrorStatus::details)
    ;

    em::enum_<otio::ErrorStatus::Outcome>("ErrorStatusOutcome")
        .value("OK", otio::ErrorStatus::OK)
        .value("NOT_IMPLEMENTED", otio::ErrorStatus::NOT_IMPLEMENTED)
        .value("UNRESOLVED_OBJECT_REFERENCE", otio::ErrorStatus::UNRESOLVED_OBJECT_REFERENCE)
        .value("DUPLICATE_OBJECT_REFERENCE", otio::ErrorStatus::DUPLICATE_OBJECT_REFERENCE)
        .value("MALFORMED_SCHEMA", otio::ErrorStatus::MALFORMED_SCHEMA)
        .value("JSON_PARSE_ERROR", otio::ErrorStatus::JSON_PARSE_ERROR)
        .value("CHILD_ALREADY_PARENTED", otio::ErrorStatus::CHILD_ALREADY_PARENTED)
        .value("FILE_OPEN_FAILED", otio::ErrorStatus::FILE_OPEN_FAILED)
        .value("FILE_WRITE_FAILED", otio::ErrorStatus::FILE_WRITE_FAILED)
        .value("SCHEMA_ALREADY_REGISTERED", otio::ErrorStatus::SCHEMA_ALREADY_REGISTERED)
        .value("SCHEMA_NOT_REGISTERED", otio::ErrorStatus::SCHEMA_NOT_REGISTERED)
        .value("SCHEMA_VERSION_UNSUPPORTED", otio::ErrorStatus::SCHEMA_VERSION_UNSUPPORTED)
        .value("KEY_NOT_FOUND", otio::ErrorStatus::KEY_NOT_FOUND)
        .value("ILLEGAL_INDEX", otio::ErrorStatus::ILLEGAL_INDEX)
        .value("TYPE_MISMATCH", otio::ErrorStatus::TYPE_MISMATCH)
        .value("INTERNAL_ERROR", otio::ErrorStatus::INTERNAL_ERROR)
        .value("NOT_AN_ITEM", otio::ErrorStatus::NOT_AN_ITEM)
        .value("NOT_A_CHILD_OF", otio::ErrorStatus::NOT_A_CHILD_OF)
        .value("NOT_A_CHILD", otio::ErrorStatus::NOT_A_CHILD)
        .value("NOT_DESCENDED_FROM", otio::ErrorStatus::NOT_DESCENDED_FROM)
        .value("CANNOT_COMPUTE_AVAILABLE_RANGE", otio::ErrorStatus::CANNOT_COMPUTE_AVAILABLE_RANGE)
        .value("INVALID_TIME_RANGE", otio::ErrorStatus::INVALID_TIME_RANGE)
        .value("OBJECT_WITHOUT_DURATION", otio::ErrorStatus::OBJECT_WITHOUT_DURATION)
        .value("CANNOT_TRIM_TRANSITION", otio::ErrorStatus::CANNOT_TRIM_TRANSITION)
        .value("OBJECT_CYCLE", otio::ErrorStatus::OBJECT_CYCLE)
        .value("CANNOT_COMPUTE_BOUNDS", otio::ErrorStatus::CANNOT_COMPUTE_BOUNDS)
        .value("MEDIA_REFERENCES_DO_NOT_CONTAIN_ACTIVE_KEY", otio::ErrorStatus::MEDIA_REFERENCES_DO_NOT_CONTAIN_ACTIVE_KEY)
        .value("MEDIA_REFERENCES_CONTAIN_EMPTY_KEY", otio::ErrorStatus::MEDIA_REFERENCES_CONTAIN_EMPTY_KEY)
        .value("NOT_A_GAP", otio::ErrorStatus::NOT_A_GAP)
    ;
}