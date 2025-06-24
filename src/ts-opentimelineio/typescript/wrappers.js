// JavaScript wrapper classes for OpenTimelineIO
class Timeline {
    constructor(name = "") {
        this._handle = Module.create_timeline(name);
    }
    
    name() {
        return Module.timeline_name(this._handle);
    }
    
    set_name(name) {
        Module.timeline_set_name(this._handle, name);
    }
    
    to_json_string() {
        return Module.timeline_to_json_string(this._handle);
    }
    
    schema_name() {
        return Module.timeline_schema_name(this._handle);
    }
    
    schema_version() {
        return Module.timeline_schema_version(this._handle);
    }
    
    duration() {
        return Module.timeline_duration(this._handle);
    }
    
    dispose() {
        if (this._handle) {
            Module.delete_timeline(this._handle);
            this._handle = null;
        }
    }
}

class Clip {
    constructor(name = "") {
        this._handle = Module.create_clip(name);
    }
    
    name() {
        return Module.clip_name(this._handle);
    }
    
    set_name(name) {
        Module.clip_set_name(this._handle, name);
    }
    
    source_range() {
        return Module.clip_source_range(this._handle);
    }
    
    set_source_range(range) {
        Module.clip_set_source_range(this._handle, range);
    }
    
    duration() {
        return Module.clip_duration(this._handle);
    }
    
    enabled() {
        return Module.clip_enabled(this._handle);
    }
    
    set_enabled(enabled) {
        Module.clip_set_enabled(this._handle, enabled);
    }
    
    to_json_string() {
        return Module.clip_to_json_string(this._handle);
    }
    
    media_reference() {
        const refHandle = Module.clip_media_reference(this._handle);
        return refHandle ? ExternalReference._fromHandle(refHandle) : null;
    }
    
    set_media_reference(ref) {
        Module.clip_set_media_reference(this._handle, ref._getHandle());
    }
    
    dispose() {
        if (this._handle) {
            Module.delete_clip(this._handle);
            this._handle = null;
        }
    }
}

class Track {
    constructor(name = "", kind = "Video") {
        this._handle = Module.create_track(name, kind);
    }
    
    name() {
        return Module.track_name(this._handle);
    }
    
    set_name(name) {
        Module.track_set_name(this._handle, name);
    }
    
    kind() {
        return Module.track_kind(this._handle);
    }
    
    set_kind(kind) {
        Module.track_set_kind(this._handle, kind);
    }
    
    enabled() {
        return Module.track_enabled(this._handle);
    }
    
    set_enabled(enabled) {
        Module.track_set_enabled(this._handle, enabled);
    }
    
    to_json_string() {
        return Module.track_to_json_string(this._handle);
    }
    
    dispose() {
        if (this._handle) {
            Module.delete_track(this._handle);
            this._handle = null;
        }
    }
}

class ExternalReference {
    constructor(target_url = "") {
        this._handle = Module.create_external_reference(target_url);
    }
    
    static _fromHandle(handle) {
        const ref = Object.create(ExternalReference.prototype);
        ref._handle = handle;
        return ref;
    }
    
    _getHandle() {
        return this._handle;
    }
    
    name() {
        return Module.external_reference_name(this._handle);
    }
    
    set_name(name) {
        Module.external_reference_set_name(this._handle, name);
    }
    
    target_url() {
        return Module.external_reference_target_url(this._handle);
    }
    
    set_target_url(url) {
        Module.external_reference_set_target_url(this._handle, url);
    }
    
    is_missing_reference() {
        return Module.external_reference_is_missing_reference(this._handle);
    }
    
    to_json_string() {
        return Module.external_reference_to_json_string(this._handle);
    }
    
    dispose() {
        if (this._handle) {
            Module.delete_external_reference(this._handle);
            this._handle = null;
        }
    }
}

class Stack {
    constructor(name = "") {
        this._handle = Module.create_stack(name);
    }
    
    dispose() {
        if (this._handle) {
            Module.delete_stack(this._handle);
            this._handle = null;
        }
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.OTIO = { Timeline, Clip, Track, ExternalReference, Stack };
} 