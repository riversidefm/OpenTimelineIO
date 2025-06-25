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
    console.log('Wrapping object with schema:', schemaName);
    
    switch (schemaName) {
        case 'Timeline.1':
        case 'Timeline':
            return Timeline._fromHandle(handle);
        case 'Track.1':
        case 'Track':
            return Track._fromHandle(handle);
        case 'Clip.1':
        case 'Clip':
            return Clip._fromHandle(handle);
        case 'Stack.1':
        case 'Stack':
            return Stack._fromHandle(handle);
        case 'ExternalReference.1':
        case 'ExternalReference':
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
        if (this._disposed || !this._handle || this._handle === 0) return;
        
        try {
            console.log('Disposing timeline with handle:', this._handle);
            Module.delete_timeline(this._handle);
        } catch (error) {
            console.warn('Error disposing timeline:', error);
        } finally {
            this._handle = null;
            this._disposed = true;
        }
    }

    // Convenience methods for clips
    add_clip(clip, index = null) {
        if (index !== null) {
            return this.insert(index, clip);
        } else {
            return this.append(clip);
        }
    }

    get_clip(index) {
        return this.child_at(index);
    }

    clip_count() {
        return this.length;
    }

    // Advanced editing operations
    overwrite_clip(clip, timeRange, removeTransitions = true) {
        // Auto-convert OpenTime TimeRange to OTIO TimeRange if needed
        let otioRange = timeRange;
        
        if (timeRange && timeRange.start_time && timeRange.duration && 
            typeof timeRange.start_time.value === 'function' && 
            typeof timeRange.duration.value === 'function') {
            console.log('Converting OpenTime TimeRange to OTIO TimeRange for overwrite');
            otioRange = convertTimeRange(timeRange);
        }
        
        return Module.timeline_overwrite_clip(this._handle, clip._handle, otioRange, removeTransitions);
    }

    insert_clip(clip, time, removeTransitions = true) {
        // Auto-convert OpenTime RationalTime to OTIO RationalTime if needed
        let otioTime = time;
        
        if (time && typeof time.value === 'function' && typeof time.rate === 'function') {
            console.log('Converting OpenTime RationalTime to OTIO RationalTime for insert');
            otioTime = convertRationalTime(time);
        }
        
        return Module.timeline_insert_clip(this._handle, clip._handle, otioTime, removeTransitions);
    }

    slice_at_time(time, removeTransitions = true) {
        // Auto-convert OpenTime RationalTime to OTIO RationalTime if needed
        let otioTime = time;
        
        if (time && typeof time.value === 'function' && typeof time.rate === 'function') {
            console.log('Converting OpenTime RationalTime to OTIO RationalTime for slice');
            otioTime = convertRationalTime(time);
        }
        
        return Module.timeline_slice_at_time(this._handle, otioTime, removeTransitions);
    }

    get_global_start_time() {
        return Module.timeline_global_start_time(this._handle);
    }

    set_global_start_time(time) {
        // Auto-convert OpenTime RationalTime to OTIO RationalTime if needed
        let otioTime = time;
        
        // Check if this is an OpenTime RationalTime (has value and rate functions)
        if (time && typeof time.value === 'function' && typeof time.rate === 'function') {
            console.log('Converting OpenTime RationalTime to OTIO RationalTime');
            otioTime = convertRationalTime(time);
        }
        
        Module.timeline_set_global_start_time(this._handle, otioTime);
    }

    get_audio_tracks() {
        const result = [];
        const count = Module.timeline_audio_tracks_count(this._handle);
        for (let i = 0; i < count; i++) {
            const trackHandle = Module.timeline_audio_track_at_index(this._handle, i);
            if (trackHandle) {
                result.push(wrapObject(trackHandle));
            }
        }
        return result;
    }

    get_video_tracks() {
        const result = [];
        const count = Module.timeline_video_tracks_count(this._handle);
        for (let i = 0; i < count; i++) {
            const trackHandle = Module.timeline_video_track_at_index(this._handle, i);
            if (trackHandle) {
                result.push(wrapObject(trackHandle));
            }
        }
        return result;
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
        if (this._disposed || !this._handle || this._handle === 0) return;
        
        try {
            console.log('Disposing clip with handle:', this._handle);
            Module.delete_clip(this._handle);
        } catch (error) {
            console.warn('Error disposing clip:', error);
        } finally {
            this._handle = null;
            this._disposed = true;
        }
    }

    // Advanced operations
    trim(deltaIn, deltaOut) {
        // Auto-convert OpenTime RationalTime to OTIO RationalTime if needed
        let otioDeltaIn = deltaIn;
        let otioDeltaOut = deltaOut;
        
        if (deltaIn && typeof deltaIn.value === 'function' && typeof deltaIn.rate === 'function') {
            otioDeltaIn = convertRationalTime(deltaIn);
        }
        if (deltaOut && typeof deltaOut.value === 'function' && typeof deltaOut.rate === 'function') {
            otioDeltaOut = convertRationalTime(deltaOut);
        }
        
        return Module.clip_trim(this._handle, otioDeltaIn, otioDeltaOut);
    }

    slip(delta) {
        // Auto-convert OpenTime RationalTime to OTIO RationalTime if needed
        let otioDelta = delta;
        
        if (delta && typeof delta.value === 'function' && typeof delta.rate === 'function') {
            otioDelta = convertRationalTime(delta);
        }
        
        Module.clip_slip(this._handle, otioDelta);
    }

    slide(delta) {
        // Auto-convert OpenTime RationalTime to OTIO RationalTime if needed
        let otioDelta = delta;
        
        if (delta && typeof delta.value === 'function' && typeof delta.rate === 'function') {
            otioDelta = convertRationalTime(delta);
        }
        
        Module.clip_slide(this._handle, otioDelta);
    }

    get_available_range() {
        return Module.clip_available_range(this._handle);
    }

    get_trimmed_range() {
        return Module.clip_trimmed_range(this._handle);
    }

    get_visible_range() {
        return Module.clip_visible_range(this._handle);
    }

    get_effects_count() {
        return Module.clip_effects_count(this._handle);
    }

    get_markers_count() {
        return Module.clip_markers_count(this._handle);
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
        if (this._disposed || !this._handle || this._handle === 0) return;
        
        try {
            console.log('Disposing track with handle:', this._handle);
            Module.delete_track(this._handle);
        } catch (error) {
            console.warn('Error disposing track:', error);
        } finally {
            this._handle = null;
            this._disposed = true;
        }
    }

    // Advanced operations
    get_available_range() {
        return Module.track_available_range(this._handle);
    }

    get_range_of_child_at_index(index) {
        return Module.track_range_of_child_at_index(this._handle, index);
    }

    get_trimmed_range_of_child_at_index(index) {
        return Module.track_trimmed_range_of_child_at_index(this._handle, index);
    }

    get_effects_count() {
        return Module.track_effects_count(this._handle);
    }

    get_markers_count() {
        return Module.track_markers_count(this._handle);
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
        if (this._disposed || !this._handle || this._handle === 0) return;
        
        try {
            console.log('Disposing external reference with handle:', this._handle);
            Module.delete_external_reference(this._handle);
        } catch (error) {
            console.warn('Error disposing external reference:', error);
        } finally {
            this._handle = null;
            this._disposed = true;
        }
    }

    // Advanced operations
    get_available_range() {
        return Module.external_reference_available_range(this._handle);
    }

    set_available_range(range) {
        Module.external_reference_set_available_range(this._handle, range);
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
        if (this._disposed || !this._handle || this._handle === 0) return;
        
        try {
            console.log('Disposing stack with handle:', this._handle);
            Module.delete_stack(this._handle);
        } catch (error) {
            console.warn('Error disposing stack:', error);
        } finally {
            this._handle = null;
            this._disposed = true;
        }
    }

    // Advanced operations
    get_range_of_child_at_index(index) {
        return Module.composition_range_of_child_at_index ? 
               Module.composition_range_of_child_at_index(this._handle, index) : 
               null;
    }
}

// Gap wrapper
class Gap {
    constructor(sourceRangeOrDuration, name = "Gap") {
        if (typeof sourceRangeOrDuration === 'object' && sourceRangeOrDuration.start_time !== undefined) {
            // It's a TimeRange - auto-convert if needed
            let otioRange = sourceRangeOrDuration;
            
            if (sourceRangeOrDuration.start_time && sourceRangeOrDuration.duration && 
                typeof sourceRangeOrDuration.start_time.value === 'function' && 
                typeof sourceRangeOrDuration.duration.value === 'function') {
                console.log('Converting OpenTime TimeRange to OTIO TimeRange for Gap');
                otioRange = convertTimeRange(sourceRangeOrDuration);
            }
            
            this._handle = Module.create_gap(otioRange, name);
        } else {
            // It's a duration (RationalTime) - auto-convert if needed
            let otioDuration = sourceRangeOrDuration;
            
            if (sourceRangeOrDuration && typeof sourceRangeOrDuration.value === 'function' && 
                typeof sourceRangeOrDuration.rate === 'function') {
                console.log('Converting OpenTime RationalTime to OTIO RationalTime for Gap duration');
                otioDuration = convertRationalTime(sourceRangeOrDuration);
            }
            
            this._handle = Module.create_gap_with_duration(otioDuration, name);
        }
    }

    get name() {
        return Module.gap_name ? Module.gap_name(this._handle) : "";
    }

    set name(value) {
        if (Module.gap_set_name) Module.gap_set_name(this._handle, value);
    }

    to_json_string() {
        return Module.gap_to_json_string(this._handle);
    }

    dispose() {
        if (this._disposed || !this._handle || this._handle === 0) return;
        
        try {
            if (Module.delete_gap) {
                console.log('Disposing gap with handle:', this._handle);
                Module.delete_gap(this._handle);
            }
        } catch (error) {
            console.warn("Error disposing Gap:", error);
        } finally {
            this._handle = null;
            this._disposed = true;
        }
    }
}

// Helper functions for editing operations
const EditingOperations = {
    // Reference points for fill operations
    ReferencePoint: {
        SOURCE: "Source",
        SEQUENCE: "Sequence", 
        FIT: "Fit"
    },

    // Trim modes
    TrimMode: {
        RIPPLE: "ripple",
        ROLL: "roll", 
        SLIP: "slip",
        SLIDE: "slide"
    },

    // Utility function to create gaps
    createGap: function(duration, name = "Gap") {
        // Auto-convert OpenTime RationalTime to OTIO RationalTime if needed
        let otioDuration = duration;
        
        if (duration && typeof duration.value === 'function' && typeof duration.rate === 'function') {
            console.log('Converting OpenTime RationalTime to OTIO RationalTime for Gap creation');
            otioDuration = convertRationalTime(duration);
        }
        
        return new Gap(otioDuration, name);
    },

    // Utility function to create time ranges
    createTimeRange: function(startTime, duration) {
        return new Module.OTIOTimeRange(startTime, duration);
    },

    // Utility function to create rational times
    createRationalTime: function(value, rate = 24) {
        return new Module.OTIORationalTime(value, rate);
    }
};

// Export all classes and utilities
window.OTIO = {
    Timeline,
    Track,
    Clip,
    ExternalReference,
    Stack,
    Gap,
    EditingOperations,
    
    // Helper functions
    wrapObject,
    convertTimeRange,
    convertRationalTime
};

// Also export OpenTime for convenience if available
if (typeof OpenTimeModule !== 'undefined') {
    window.OTIO.OpenTime = OpenTimeModule;
}

// Test functions 