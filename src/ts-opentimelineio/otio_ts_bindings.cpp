#include <emscripten/bind.h>
#include "otio_ts_bindings.h"

#include <Imath/ImathBox.h>

#include "anyDictionaryProxy.h"

#include <algorithm>
#include <regex>

namespace otio = opentimelineio::OPENTIMELINEIO_VERSION;
namespace ot = opentime::OPENTIME_VERSION;
namespace em = emscripten;

using ChildHandles = std::pair<std::optional<otio::RationalTime>, std::optional<otio::RationalTime>>;
using Neighbors = std::pair<Retainer<otio::Composable>, Retainer<otio::Composable>>;

EMSCRIPTEN_BINDINGS(opentimeline) {
    // Register types
    em::register_map<std::string, int64_t>("MapStringInt64");
    em::register_vector<Retainer<otio::Composable>>("VectorComposable");
    em::register_vector<Retainer<otio::Effect>>("VectorEffect");
    em::register_vector<Retainer<otio::Marker>>("VectorMarker");
    em::register_vector<Retainer<otio::Track>>("VectorTrack");
    em::register_optional<IMATH_NAMESPACE::Box2d>();
    em::register_optional<ot::RationalTime>();
    em::register_optional<ot::TimeRange>();

    em::value_object<ChildHandles>("ChildHandles")
        .field("in", &ChildHandles::first)
        .field("out", &ChildHandles::second);

    em::value_object<Neighbors>("Neighbors")
        .field("previous", &Neighbors::first)
        .field("next", &Neighbors::second);

    // AnyDictionaryProxy bindings
    em::class_<AnyDictionaryProxyTS>("AnyDictionary")
        .function("has_key", &AnyDictionaryProxyTS::has_key)
        .function("set_string", &AnyDictionaryProxyTS::set_string)
        .function("get_string", &AnyDictionaryProxyTS::get_string)
        .function("set_bool", &AnyDictionaryProxyTS::set_bool)
        .function("get_bool", &AnyDictionaryProxyTS::get_bool)
        .function("set_number", &AnyDictionaryProxyTS::set_number)
        .function("get_number", &AnyDictionaryProxyTS::get_number)
        .function("set_integer", &AnyDictionaryProxyTS::set_integer)
        .function("get_integer", &AnyDictionaryProxyTS::get_integer);

    // IMath bindings
    em::class_<IMATH_NAMESPACE::V2d>("V2d")
        .constructor<double, double>()
        .property("x", &IMATH_NAMESPACE::V2d::x)
        .property("y", &IMATH_NAMESPACE::V2d::y);

    em::class_<IMATH_NAMESPACE::Box2d>("Box2d")
        .constructor<IMATH_NAMESPACE::V2d, IMATH_NAMESPACE::V2d>()
        .property("min", &IMATH_NAMESPACE::Box2d::min)
        .property("max", &IMATH_NAMESPACE::Box2d::max);

    // OpenTime bindings
    em::class_<ot::RationalTime>("RationalTime")
        .constructor<double, double>()
        .function("is_invalid_time", &ot::RationalTime::is_invalid_time)
        .function("is_valid_time", &ot::RationalTime::is_valid_time)
        .property("value", &ot::RationalTime::value)
        .property("rate", &ot::RationalTime::rate)
        .function("to_time_string", &ot::RationalTime::to_time_string, em::allow_raw_pointers())
        .class_function("from_seconds", em::select_overload<ot::RationalTime(double)>(&ot::RationalTime::from_seconds))
        .class_function("from_seconds_rate", em::select_overload<ot::RationalTime(double, double)>(&ot::RationalTime::from_seconds));

    em::class_<ot::TimeRange>("TimeRange")
        .constructor<ot::RationalTime>()
        .constructor<ot::RationalTime, ot::RationalTime>()
        .constructor<double, double, double>()
        .function("is_invalid_range", &ot::TimeRange::is_invalid_range)
        .function("is_valid_range", &ot::TimeRange::is_valid_range)
        .property("start_time", &ot::TimeRange::start_time)
        .property("duration", &ot::TimeRange::duration)
        .property("end_time_inclusive", &ot::TimeRange::end_time_inclusive)
        .property("end_time_exclusive", &ot::TimeRange::end_time_exclusive);

    // OpenTimelineIO bindings
    em::class_<otio::SerializableObject>("SerializableObject")
        .smart_ptr_constructor("SerializableObject", em::select_overload<Retainer<otio::SerializableObject>()>(
            [](){ return Retainer<otio::SerializableObject>(new otio::SerializableObject()); }
        ))
        .function("to_json_string",
            em::select_overload<std::string(otio::SerializableObject&, otio::ErrorStatus*)>(
                [](otio::SerializableObject& self, otio::ErrorStatus* error_status) {
                    return self.to_json_string(error_status);
                }),
            em::allow_raw_pointers())
        .class_function("from_json_string",
            em::select_overload<Retainer<otio::SerializableObject>(const std::string&, otio::ErrorStatus*)>(
                [](const std::string &json_string, otio::ErrorStatus* error_status) {
                    return Retainer<otio::SerializableObject>(otio::SerializableObject::from_json_string(json_string, error_status));
                }),
            em::allow_raw_pointers());

    em::class_<otio::SerializableObjectWithMetadata, em::base<otio::SerializableObject>>("SerializableObjectWithMetadata")
        .smart_ptr_constructor("SerializableObjectWithMetadata",
            em::select_overload<Retainer<otio::SerializableObjectWithMetadata>(const std::string&)>(
                [](const std::string &name){
                    return otio::SerializableObjectWithMetadata::Retainer<otio::SerializableObjectWithMetadata>(
                        new otio::SerializableObjectWithMetadata(name, otio::AnyDictionary()));
                }
        ))
        .property("name", &otio::SerializableObjectWithMetadata::name, &otio::SerializableObjectWithMetadata::set_name)
        .function("metadata", em::select_overload<AnyDictionaryProxyTS(otio::SerializableObjectWithMetadata&)>(
            [](otio::SerializableObjectWithMetadata& self) {
                return AnyDictionaryProxyTS(self.metadata().get_or_create_mutation_stamp());
            }));

    em::class_<otio::Composable, em::base<otio::SerializableObjectWithMetadata>>("Composable")
        .smart_ptr_constructor("Composable", em::select_overload<Retainer<otio::Composable>(const std::string&)>(
            [](const std::string &name){ return otio::Composable::Retainer<otio::Composable>(new otio::Composable(name)); }
        ))
        .property("visible", &otio::Composable::visible)
        .property("overlapping", &otio::Composable::overlapping)
        .function("parent", em::select_overload<Retainer<otio::Composable>(const otio::Composable&)>(
            [](const otio::Composable& self) {
                return Retainer<otio::Composable>(self.parent());
            }
        ))
        .property("available_image_bounds", em::select_overload<std::optional<IMATH_NAMESPACE::Box2d>(const otio::Composable&)>(
            [](const otio::Composable& self) {
                otio::ErrorStatus error_status;
                auto bounds = self.available_image_bounds(&error_status);
                if (error_status.outcome == otio::ErrorStatus::Outcome::OK) {
                    return std::optional<IMATH_NAMESPACE::Box2d>(bounds);
                }
                return std::optional<IMATH_NAMESPACE::Box2d>();
            }))
        .property("duration", em::select_overload<std::optional<otio::RationalTime>(const otio::Composable&)>(
            [](const otio::Composable& self) {
                otio::ErrorStatus error_status;
                auto duration = self.duration(&error_status);
                if (error_status.outcome == otio::ErrorStatus::Outcome::OK) {
                    return std::optional<otio::RationalTime>(duration);
                }
                return std::optional<otio::RationalTime>();
            }));

    em::class_<otio::Item, em::base<otio::Composable>>("Item")
        .smart_ptr_constructor("Item", em::select_overload<Retainer<otio::Item>(const std::string&)>(
            [](const std::string &name){ return otio::Item::Retainer<otio::Item>(new otio::Item(name)); }
        ))
        .property("enabled", &otio::Item::enabled, &otio::Item::set_enabled)
        .property("visible", &otio::Item::visible)
        .property("overlapping", &otio::Item::overlapping)
        .property("source_range", &otio::Item::source_range, &otio::Item::set_source_range)
        .property("available_range", em::select_overload<std::optional<otio::TimeRange>(const otio::Item&)>(
            [](const otio::Item& self) -> std::optional<otio::TimeRange> {
                otio::ErrorStatus error_status;
                auto range = self.available_range(&error_status);
                if (error_status.outcome == otio::ErrorStatus::Outcome::OK) {
                    return range;
                }
                return std::nullopt;
            }))
        .function("markers", em::select_overload<std::vector<Retainer<otio::Marker>>& ()>(&otio::Item::markers), em::return_value_policy::reference())
        .function("effects", em::select_overload<std::vector<Retainer<otio::Effect>>& ()>(&otio::Item::effects), em::return_value_policy::reference());

    em::class_<otio::Composition, em::base<otio::Item>>("Composition")
        .smart_ptr_constructor("Composition", em::select_overload<Retainer<otio::Composition>(const std::string&)>(
            [](const std::string &name){ return otio::Composition::Retainer<otio::Composition>(new otio::Composition(name)); }
        ))
        .property("composition_kind", &otio::Composition::composition_kind)
        .property("children", &otio::Composition::children)
        .function("clear_children", &otio::Composition::clear_children)
        .function("remove_child", &otio::Composition::remove_child, em::allow_raw_pointers())
        .function("append_child", em::select_overload<bool(otio::Composition&, Retainer<otio::Composable> &, otio::ErrorStatus *)>(
            [](otio::Composition& self, Retainer<otio::Composable> &child, otio::ErrorStatus *error_status) {
                return self.append_child(child.value, error_status);
            }),
            em::allow_raw_pointers())
        .function("append_child", em::select_overload<bool(otio::Composition&, Retainer<otio::Composable> &)>(
            [](otio::Composition& self, Retainer<otio::Composable> &child) {
                return self.append_child(child.value, nullptr);
            }))
        .function("set_children", em::select_overload<bool(otio::Composition&, std::vector<Retainer<otio::Composable>> &, otio::ErrorStatus *)>(
            [](otio::Composition& self, std::vector<Retainer<otio::Composable>> &children, otio::ErrorStatus *error_status) {
                std::vector<otio::Composable*> child_ptrs;
                std::transform(children.begin(),
                               children.end(),
                               std::back_inserter(child_ptrs),
                               [](Retainer<otio::Composable> &child) { return child.value; });
                return self.set_children(child_ptrs, error_status);
            }),
            em::allow_raw_pointers())
        .function("insert_child",
            em::select_overload<bool(otio::Composition&, int, Retainer<otio::Composable> &, otio::ErrorStatus *)>(
                [](otio::Composition& self, int index, Retainer<otio::Composable> &child, otio::ErrorStatus *error_status) {
                    return self.insert_child(index, child.value, error_status);
                }),
            em::allow_raw_pointers())
        .function("set_child",
            em::select_overload<bool(otio::Composition&, int, Retainer<otio::Composable> &, otio::ErrorStatus *)>(
                [](otio::Composition& self, int index, Retainer<otio::Composable> &child, otio::ErrorStatus *error_status) {
                    return self.set_child(index, child.value, error_status);
                }),
            em::allow_raw_pointers())
        .function("index_of_child",
            em::select_overload<int(otio::Composition&, Retainer<otio::Composable> &, otio::ErrorStatus *)>(
                [](otio::Composition& self, Retainer<otio::Composable> &child, otio::ErrorStatus *error_status) {
                    return self.index_of_child(child.value, error_status);
                }),
            em::allow_raw_pointers())
        .function("is_parent_of",
            em::select_overload<bool(otio::Composition&, Retainer<otio::Composable> &)>(
                [](otio::Composition& self, Retainer<otio::Composable> &child) {
                    return self.is_parent_of(child.value);
                }))
        .function("handles_of_child",
            em::select_overload<ChildHandles(otio::Composition&, Retainer<otio::Composable> &, otio::ErrorStatus *)>(
                [](otio::Composition& self, Retainer<otio::Composable> &child, otio::ErrorStatus *error_status) {
                    return self.handles_of_child(child.value, error_status);
                }),
            em::allow_raw_pointers())
        .function("range_of_child_at_index",
            em::select_overload<otio::TimeRange(otio::Composition&, int, otio::ErrorStatus *)>(
                [](otio::Composition& self, int index, otio::ErrorStatus *error_status) {
                    return self.range_of_child_at_index(index, error_status);
                }),
            em::allow_raw_pointers())
        .function("trimmed_range_of_child_at_index",
            em::select_overload<otio::TimeRange(otio::Composition&, int, otio::ErrorStatus *)>(
                [](otio::Composition& self, int index, otio::ErrorStatus *error_status) {
                    return self.trimmed_range_of_child_at_index(index, error_status);
                }),
            em::allow_raw_pointers())
        .function("range_of_child",
            em::select_overload<otio::TimeRange(otio::Composition&, Retainer<otio::Composable> &, otio::ErrorStatus *)>(
                [](otio::Composition& self, Retainer<otio::Composable> &child, otio::ErrorStatus *error_status) {
                    return self.range_of_child(child.value, error_status);
                }),
            em::allow_raw_pointers())
        .function("trimmed_range_of_child",
            em::select_overload<std::optional<otio::TimeRange>(otio::Composition&, Retainer<otio::Composable> &, otio::ErrorStatus *)>(
                [](otio::Composition& self, Retainer<otio::Composable> &child, otio::ErrorStatus *error_status) {
                    return self.trimmed_range_of_child(child.value, error_status);
                }),
            em::allow_raw_pointers())
        .function("trim_child_range",
            em::select_overload<std::optional<otio::TimeRange>(otio::Composition&, otio::TimeRange &)>(
                [](otio::Composition& self, otio::TimeRange &child_range) {
                    return self.trim_child_range(child_range);
                }))
        .function("has_child",
            em::select_overload<bool(otio::Composition&, Retainer<otio::Composable> &)>(
                [](otio::Composition& self, Retainer<otio::Composable> &child) {
                    return self.has_child(child.value);
                }))
        .function("has_clips",
            em::select_overload<bool(otio::Composition&)>(
                [](otio::Composition& self) { return self.has_clips(); }))
        .function("child_at_time",
            em::select_overload<Retainer<otio::Composable>(otio::Composition&, ot::RationalTime &, otio::ErrorStatus *, bool)>(
                [](otio::Composition& self, ot::RationalTime &search_time, otio::ErrorStatus *error_status, bool shallow_search) {
                    return self.child_at_time(search_time, error_status, shallow_search);
                }),
            em::allow_raw_pointers())
        .function("children_in_range",
            em::select_overload<std::vector<Retainer<otio::Composable>>(otio::Composition&, ot::TimeRange &, otio::ErrorStatus *)>(
                [](otio::Composition& self, ot::TimeRange &search_range, otio::ErrorStatus *error_status) {
                    return self.children_in_range(search_range, error_status);
                }),
            em::allow_raw_pointers())
        .function("find_children_composable",
            em::select_overload<std::vector<Retainer<otio::Composable>>(otio::Composition&, otio::ErrorStatus *, ot::TimeRange &, bool)>(
                [](otio::Composition& self, otio::ErrorStatus *error_status, ot::TimeRange &search_range, bool shallow_search) {
                    return self.find_children<otio::Composable>(error_status, search_range, shallow_search);
                }),
            em::allow_raw_pointers())
        .function("find_children_item",
            em::select_overload<std::vector<Retainer<otio::Item>>(otio::Composition&, otio::ErrorStatus *, ot::TimeRange &, bool)>(
                [](otio::Composition& self, otio::ErrorStatus *error_status, ot::TimeRange &search_range, bool shallow_search) {
                    return self.find_children<otio::Item>(error_status, search_range, shallow_search);
                }),
            em::allow_raw_pointers())
        .function("find_children_clip",
            em::select_overload<std::vector<Retainer<otio::Clip>>(otio::Composition&, otio::ErrorStatus *, ot::TimeRange &, bool)>(
                [](otio::Composition& self, otio::ErrorStatus *error_status, ot::TimeRange &search_range, bool shallow_search) {
                    return self.find_children<otio::Clip>(error_status, search_range, shallow_search);
                }),
            em::allow_raw_pointers())
        .function("find_children_gap",
            em::select_overload<std::vector<Retainer<otio::Gap>>(otio::Composition&, otio::ErrorStatus *, ot::TimeRange &, bool)>(
                [](otio::Composition& self, otio::ErrorStatus *error_status, ot::TimeRange &search_range, bool shallow_search) {
                    return self.find_children<otio::Gap>(error_status, search_range, shallow_search);
                }),
            em::allow_raw_pointers());

    em::class_<otio::Marker, em::base<otio::SerializableObjectWithMetadata>>("Marker")
        .smart_ptr_constructor("Marker", em::select_overload<Retainer<otio::Marker>(const std::string&, const std::string&, const std::string&)>(
            [](const std::string &name, const std::string &color, const std::string &comment){
                return otio::Marker::Retainer<otio::Marker>(new otio::Marker(name, ot::TimeRange(), color, otio::AnyDictionary(), comment));
            }
        ))
        .property("color", &otio::Marker::color, &otio::Marker::set_color)
        .property("comment", &otio::Marker::comment, &otio::Marker::set_comment)
        .property("marked_range", &otio::Marker::marked_range, &otio::Marker::set_marked_range);

    em::class_<otio::Effect, em::base<otio::SerializableObjectWithMetadata>>("Effect")
        .smart_ptr_constructor("Effect", em::select_overload<Retainer<otio::Effect>(const std::string&, const std::string&, bool)>(
            [](const std::string &name, const std::string &effect_name, bool enabled){
                return otio::Effect::Retainer<otio::Effect>(new otio::Effect(name, effect_name, otio::AnyDictionary(), enabled));
            }
        ))
        .property("effect_name", &otio::Effect::effect_name, &otio::Effect::set_effect_name)
        .property("enabled", &otio::Effect::enabled, &otio::Effect::set_enabled);

    em::class_<otio::Gap, em::base<otio::Item>>("Gap")
        .smart_ptr_constructor("Gap", em::select_overload<Retainer<otio::Gap>(const std::string&)>(
            [](const std::string &name){ return otio::Gap::Retainer<otio::Gap>(new otio::Gap(otio::TimeRange(), name)); }
        ));

    em::class_<otio::MediaReference, em::base<otio::SerializableObjectWithMetadata>>("MediaReference")
        .smart_ptr_constructor("MediaReference", em::select_overload<Retainer<otio::MediaReference>(const std::string&)>(
            [](const std::string &name){ return otio::MediaReference::Retainer<otio::MediaReference>(new otio::MediaReference(name)); }
        ))
        .property("available_range", &otio::MediaReference::available_range, &otio::MediaReference::set_available_range)
        .property("available_image_bounds", &otio::MediaReference::available_image_bounds, &otio::MediaReference::set_available_image_bounds)
        .function("is_missing_reference", &otio::MediaReference::is_missing_reference);

    em::class_<otio::ExternalReference, em::base<otio::MediaReference>>("ExternalReference")
        .smart_ptr_constructor("ExternalReference", em::select_overload<Retainer<otio::ExternalReference>(const std::string&)>(
            [](const std::string &url){ return otio::ExternalReference::Retainer<otio::ExternalReference>(new otio::ExternalReference(url)); }
        ))
        .property("target_url", &otio::ExternalReference::target_url, &otio::ExternalReference::set_target_url);

    em::class_<otio::Clip, em::base<otio::Item>>("Clip")
        .smart_ptr_constructor("Clip", em::select_overload<Retainer<otio::Clip>(const std::string&)>(
            [](const std::string &name){ return otio::Clip::Retainer<otio::Clip>(new otio::Clip(name)); }
        ))
        .property("media_reference",
            em::select_overload<Retainer<otio::MediaReference>(const otio::Clip&)>(
                [](const otio::Clip& self) {
                    return Retainer<otio::MediaReference>(self.media_reference());
                }
            ),
            em::select_overload<void(otio::Clip&, Retainer<otio::MediaReference> &)>(
                [](otio::Clip& self, Retainer<otio::MediaReference> &media_reference) {
                    self.set_media_reference(media_reference.value);
                }
        ))
        .property("active_media_reference_key",
            &otio::Clip::active_media_reference_key,
            em::select_overload<void(otio::Clip&, std::string const&)>(
                [](otio::Clip& self, std::string const& key) {
                    self.set_active_media_reference_key(key, nullptr);
                }),
            em::allow_raw_pointers());

    em::class_<otio::Stack, em::base<otio::Composition>>("Stack")
        .smart_ptr_constructor("Stack",
            em::select_overload<Retainer<otio::Stack>(const std::string&)>(
                [](const std::string &name){ return otio::Stack::Retainer<otio::Stack>(new otio::Stack(name)); }
            ))
        .function("children_in_range",
            em::select_overload<std::vector<Retainer<otio::Composable>>(otio::Stack&, ot::TimeRange &, otio::ErrorStatus *)>(
                [](otio::Stack& self, ot::TimeRange &search_range, otio::ErrorStatus *error_status) {
                    return self.children_in_range(search_range, error_status);
                }),
            em::allow_raw_pointers())
        .function("find_clips",
            em::select_overload<std::vector<Retainer<otio::Clip>>(otio::Stack&, otio::ErrorStatus *, ot::TimeRange &, bool)>(
                [](otio::Stack& self, otio::ErrorStatus *error_status, ot::TimeRange &search_range, bool shallow_search) {
                    return self.find_clips(error_status, search_range, shallow_search);
                }),
            em::allow_raw_pointers());

    em::enum_<otio::Track::NeighborGapPolicy>("NeighborGapPolicy")
        .value("never", otio::Track::NeighborGapPolicy::never)
        .value("around_transitions", otio::Track::NeighborGapPolicy::around_transitions);

    em::class_<otio::Track, em::base<otio::Composition>>("Track")
        .smart_ptr_constructor("Track",
            em::select_overload<Retainer<otio::Track>(std::string const&, std::string const&)>(
                [](const std::string &name, std::string const& kind){
                    return otio::Track::Retainer<otio::Track>(new otio::Track(name, std::nullopt, kind, otio::AnyDictionary()));
                }
            ))
        .property("kind", &otio::Track::kind, &otio::Track::set_kind)
        .function("handles_of_child", em::select_overload<ChildHandles(otio::Track&, Retainer<otio::Composable> &, otio::ErrorStatus *)>(
            [](otio::Track& self, Retainer<otio::Composable> &child, otio::ErrorStatus *error_status) {
                return self.handles_of_child(child.value, error_status);
            }),
            em::allow_raw_pointers())
        .function("neighbors_of",
            em::select_overload<Neighbors(otio::Track&, Retainer<otio::Composable> &, otio::ErrorStatus *, otio::Track::NeighborGapPolicy)>(
                [](otio::Track& self, Retainer<otio::Composable> &child, otio::ErrorStatus *error_status, otio::Track::NeighborGapPolicy gap_policy) {
                    return self.neighbors_of(child.value, error_status, gap_policy);
                }),
            em::allow_raw_pointers());

    em::class_<otio::Timeline, em::base<otio::SerializableObjectWithMetadata>>("Timeline")
        .smart_ptr_constructor("Timeline", em::select_overload<Retainer<otio::Timeline>(const std::string&)>(
            [](const std::string &name){ return otio::Timeline::Retainer<otio::Timeline>(new otio::Timeline(name)); }
        ))
        .property("tracks",
            em::select_overload<Retainer<otio::Stack>(const otio::Timeline&)>(
                [](const otio::Timeline& self) {
                    return Retainer<otio::Stack>(self.tracks());
                }
            ),
            em::select_overload<void(otio::Timeline&, Retainer<otio::Stack> &)>(
                [](otio::Timeline& self, Retainer<otio::Stack> &tracks) {
                    self.set_tracks(tracks.value);
                }
            ))
        .property("global_start_time", &otio::Timeline::global_start_time, &otio::Timeline::set_global_start_time)
        .property("canvas_size", &otio::Timeline::canvas_size, &otio::Timeline::set_canvas_size)
        .property("duration", em::select_overload<std::optional<otio::RationalTime>(const otio::Timeline&)>(
            [](const otio::Timeline& self) {
                otio::ErrorStatus error_status;
                auto duration = self.duration(&error_status);
                if (error_status.outcome == otio::ErrorStatus::Outcome::OK) {
                    return std::optional<otio::RationalTime>(duration);
                }
                return std::optional<otio::RationalTime>();
            }))
        .property("audio_tracks", em::select_overload<std::vector<Retainer<otio::Track>>(const otio::Timeline&)>(
            [](const otio::Timeline& self) {
                auto track_ptrs = self.audio_tracks();
                std::vector<Retainer<otio::Track>> tracks;
                std::transform(track_ptrs.begin(), track_ptrs.end(), std::back_inserter(tracks), [](otio::Track* track) {
                    return Retainer<otio::Track>(track);
                });
                return tracks;
            }))
        .property("video_tracks", em::select_overload<std::vector<Retainer<otio::Track>>(const otio::Timeline&)>(
            [](const otio::Timeline& self) {
                auto track_ptrs = self.video_tracks();
                std::vector<Retainer<otio::Track>> tracks;
                std::transform(track_ptrs.begin(), track_ptrs.end(), std::back_inserter(tracks), [](otio::Track* track) {
                    return Retainer<otio::Track>(track);
                });
                return tracks;
            }))
        .property("available_image_bounds", em::select_overload<std::optional<IMATH_NAMESPACE::Box2d>(const otio::Timeline&)>(
            [](const otio::Timeline& self) {
                otio::ErrorStatus error_status;
                auto bounds = self.available_image_bounds(&error_status);
                if (error_status.outcome == otio::ErrorStatus::Outcome::OK) {
                    return std::optional<IMATH_NAMESPACE::Box2d>(bounds);
                }
                return std::optional<IMATH_NAMESPACE::Box2d>();
            }))
        .function("find_clips", &otio::Timeline::find_clips, em::allow_raw_pointers())
        .function("range_of_child", em::select_overload<otio::TimeRange(otio::Timeline&, Retainer<otio::Composable> &, otio::ErrorStatus *)>(
            [](otio::Timeline& self, Retainer<otio::Composable> &child, otio::ErrorStatus *error_status) {
                return self.range_of_child(child.value, error_status);
            }),
            em::allow_raw_pointers());

    em::function("timeline_from_json_string",
        em::select_overload<Retainer<otio::Timeline>(const std::string&, otio::ErrorStatus*)>(
            [](const std::string &json_string, otio::ErrorStatus* error_status) {
                return Retainer<otio::Timeline>(
                    dynamic_cast<otio::Timeline*>(
                        otio::SerializableObject::from_json_string(json_string, error_status)
                    )
                );
            }),
        em::allow_raw_pointers());
}

