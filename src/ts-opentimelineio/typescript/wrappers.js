// JavaScript wrapper classes for OpenTimelineIO
// Updated: 2025-06-24 - Added TimeRange conversion support

// Helper function to convert OpenTime types to OTIO types
function convertTimeRange(openTimeRange) {
    if (!openTimeRange) return null;
    
    // Create OTIO time objects from OpenTime objects
    const otioStartTime = new Module.OTIORationalTime(
        openTimeRange.start_time.value(), 
        openTimeRange.start_time.rate()
    );
    const otioDuration = new Module.OTIORationalTime(
        openTimeRange.duration.value(), 
        openTimeRange.duration.rate()
    );
    
    return new Module.OTIOTimeRange(otioStartTime, otioDuration);
}

function convertRationalTime(openTimeRationalTime) {
    if (!openTimeRationalTime) return null;
    
    return new Module.OTIORationalTime(
        openTimeRationalTime.value(), 
        openTimeRationalTime.rate()
    );
}

// Helper function to wrap handles back into proper wrapper classes
function wrapObject(handle) {
    if (!handle) return null;
    
    const schemaName = Module.get_object_schema_name(handle);
    switch (schemaName) {
        case 'Timeline.1':
            return Timeline._fromHandle(handle);
        case 'Track.1':
            return Track._fromHandle(handle);
        case 'Clip.1':
            return Clip._fromHandle(handle);
        case 'Stack.1':
            return Stack._fromHandle(handle);
        case 'ExternalReference.1':
            return ExternalReference._fromHandle(handle);
        default:
            console.warn('Unknown schema type:', schemaName);
            return null;
    }
}

class Timeline {
    constructor(name = "") {
        this._handle = Module.create_timeline(name);
    }
    
    static _fromHandle(handle) {
        const timeline = Object.create(Timeline.prototype);
        timeline._handle = handle;
        return timeline;
    }
    
    _getHandle() {
        return this._handle;
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
    
    // Timeline composition operations
    tracks() {
        const tracksHandle = Module.timeline_tracks(this._handle);
        return tracksHandle ? Stack._fromHandle(tracksHandle) : null;
    }
    
    add_track(track) {
        const tracks = this.tracks();
        return tracks ? tracks.append(track) : false;
    }
    
    insert_track(index, track) {
        const tracks = this.tracks();
        return tracks ? tracks.insert(index, track) : false;
    }
    
    remove_track(index) {
        const tracks = this.tracks();
        return tracks ? tracks.remove(index) : false;
    }
    
    get_track(index) {
        const tracks = this.tracks();
        return tracks ? tracks.child_at(index) : null;
    }
    
    track_count() {
        const tracks = this.tracks();
        return tracks ? tracks.length : 0;
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
    
    static _fromHandle(handle) {
        const clip = Object.create(Clip.prototype);
        clip._handle = handle;
        return clip;
    }
    
    _getHandle() {
        return this._handle;
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
        // Auto-convert OpenTime TimeRange to OTIO TimeRange if needed
        let otioRange = range;
        
        // Check if this is an OpenTime TimeRange (has start_time and duration properties)
        if (range && range.start_time && range.duration && 
            typeof range.start_time.value === 'function' && 
            typeof range.duration.value === 'function') {
            
            console.log('Converting OpenTime TimeRange to OTIO TimeRange');
            otioRange = convertTimeRange(range);
        }
        
        Module.clip_set_source_range(this._handle, otioRange);
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
    
    static _fromHandle(handle) {
        const track = Object.create(Track.prototype);
        track._handle = handle;
        return track;
    }
    
    _getHandle() {
        return this._handle;
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
    
    // Track composition operations (Track inherits from Composition)
    get length() {
        return Module.composition_children_count(this._handle);
    }
    
    child_at(index) {
        const childHandle = Module.composition_child_at_index(this._handle, index);
        return wrapObject(childHandle);
    }
    
    append(item) {
        return Module.composition_append_child(this._handle, item._getHandle());
    }
    
    insert(index, item) {
        return Module.composition_insert_child(this._handle, index, item._getHandle());
    }
    
    remove(index) {
        return Module.composition_remove_child(this._handle, index);
    }
    
    index_of(item) {
        return Module.composition_index_of_child(this._handle, item._getHandle());
    }
    
    // Convenience methods for clips
    add_clip(clip) {
        return this.append(clip);
    }
    
    insert_clip(index, clip) {
        return this.insert(index, clip);
    }
    
    remove_clip(index) {
        return this.remove(index);
    }
    
    get_clip(index) {
        return this.child_at(index);
    }
    
    clip_count() {
        return this.length;
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
    
    static _fromHandle(handle) {
        const stack = Object.create(Stack.prototype);
        stack._handle = handle;
        return stack;
    }
    
    _getHandle() {
        return this._handle;
    }
    
    name() {
        return Module.stack_name(this._handle);
    }
    
    set_name(name) {
        Module.stack_set_name(this._handle, name);
    }
    
    to_json_string() {
        return Module.stack_to_json_string(this._handle);
    }
    
    // Stack composition operations (Stack inherits from Composition)
    get length() {
        return Module.composition_children_count(this._handle);
    }
    
    child_at(index) {
        const childHandle = Module.composition_child_at_index(this._handle, index);
        return wrapObject(childHandle);
    }
    
    append(item) {
        return Module.composition_append_child(this._handle, item._getHandle());
    }
    
    insert(index, item) {
        return Module.composition_insert_child(this._handle, index, item._getHandle());
    }
    
    remove(index) {
        return Module.composition_remove_child(this._handle, index);
    }
    
    index_of(item) {
        return Module.composition_index_of_child(this._handle, item._getHandle());
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