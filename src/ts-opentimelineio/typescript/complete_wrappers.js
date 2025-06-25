// Complete OTIO JavaScript Wrappers
// Provides object-oriented API on top of OpenTime + simple OTIO functions

// Store references to avoid GC
const _objectRegistry = new Map();
let _nextId = 1;

function registerObject(obj) {
    const id = `obj_${_nextId++}`;
    _objectRegistry.set(id, obj);
    return id;
}

function getObject(id) {
    return _objectRegistry.get(id);
}

function disposeObject(id) {
    const obj = _objectRegistry.get(id);
    if (obj && typeof obj.dispose === 'function') {
        obj.dispose();
    }
    _objectRegistry.delete(id);
}

// Base class for all OTIO objects
class OTIOObject {
    constructor() {
        this._id = registerObject(this);
        this._disposed = false;
    }

    dispose() {
        if (!this._disposed) {
            this._disposed = true;
            disposeObject(this._id);
        }
    }

    get disposed() {
        return this._disposed;
    }
}

// External Reference class
class ExternalReference extends OTIOObject {
    constructor(targetUrl, availableRange) {
        super();
        this.targetUrl = targetUrl || '';
        this.availableRange = availableRange || null;
    }

    to_json_string() {
        return JSON.stringify({
            OTIO_SCHEMA: 'ExternalReference.1',
            target_url: this.targetUrl,
            available_range: this.availableRange ? {
                OTIO_SCHEMA: 'TimeRange.1', 
                start_time: {
                    OTIO_SCHEMA: 'RationalTime.1',
                    rate: this.availableRange.start_time.rate(),
                    value: this.availableRange.start_time.value()
                },
                duration: {
                    OTIO_SCHEMA: 'RationalTime.1', 
                    rate: this.availableRange.duration.rate(),
                    value: this.availableRange.duration.value()
                }
            } : null
        });
    }
}

// Clip class
class Clip extends OTIOObject {
    constructor(name, mediaReference, sourceRange) {
        super();
        this.name = name || '';
        this.mediaReference = mediaReference || null;
        this.sourceRange = sourceRange || null;
        this.effects = [];
        this.markers = [];
    }

    duration() {
        if (this.sourceRange) {
            return this.sourceRange.duration;
        }
        return null;
    }

    get_effects_count() {
        return this.effects.length;
    }

    get_markers_count() {
        return this.markers.length;
    }

    available_range() {
        if (this.mediaReference && this.mediaReference.availableRange) {
            return this.mediaReference.availableRange;
        }
        return null;
    }

    trimmed_range() {
        return this.sourceRange;
    }

    visible_range() {
        return this.sourceRange;
    }

    trim(trimmedRange) {
        this.sourceRange = trimmedRange;
    }

    to_json_string() {
        return JSON.stringify({
            OTIO_SCHEMA: 'Clip.2',
            name: this.name,
            source_range: this.sourceRange ? {
                OTIO_SCHEMA: 'TimeRange.1',
                start_time: {
                    OTIO_SCHEMA: 'RationalTime.1',
                    rate: this.sourceRange.start_time.rate(),
                    value: this.sourceRange.start_time.value()
                },
                duration: {
                    OTIO_SCHEMA: 'RationalTime.1',
                    rate: this.sourceRange.duration.rate(), 
                    value: this.sourceRange.duration.value()
                }
            } : null,
            media_reference: this.mediaReference ? JSON.parse(this.mediaReference.to_json_string()) : null
        });
    }
}

// Gap class 
class Gap extends OTIOObject {
    constructor(name, sourceRange) {
        super();
        this.name = name || 'Gap';
        this.sourceRange = sourceRange || null;
        this.effects = [];
        this.markers = [];
    }

    duration() {
        if (this.sourceRange) {
            return this.sourceRange.duration;
        }
        return null;
    }

    get_effects_count() {
        return this.effects.length;
    }

    get_markers_count() {
        return this.markers.length;
    }

    to_json_string() {
        return JSON.stringify({
            OTIO_SCHEMA: 'Gap.1',
            name: this.name,
            source_range: this.sourceRange ? {
                OTIO_SCHEMA: 'TimeRange.1',
                start_time: {
                    OTIO_SCHEMA: 'RationalTime.1',
                    rate: this.sourceRange.start_time.rate(),
                    value: this.sourceRange.start_time.value()
                },
                duration: {
                    OTIO_SCHEMA: 'RationalTime.1',
                    rate: this.sourceRange.duration.rate(),
                    value: this.sourceRange.duration.value()
                }
            } : null
        });
    }
}

// Track class
class Track extends OTIOObject {
    constructor(name, kind) {
        super();
        this.name = name || '';
        this.kind = kind || 'Video';
        this.children = [];
        this.effects = [];
        this.markers = [];
    }

    append_child(child) {
        this.children.push(child);
    }

    insert_child(index, child) {
        this.children.splice(index, 0, child);
    }

    remove_child(index) {
        if (index >= 0 && index < this.children.length) {
            return this.children.splice(index, 1)[0];
        }
        return null;
    }

    child_at_index(index) {
        return this.children[index] || null;
    }

    children_count() {
        return this.children.length;
    }

    // Convenience methods for clips
    append_clip(clip) {
        this.append_child(clip);
    }

    insert_clip(index, clip) {
        this.insert_child(index, clip);
    }

    remove_clip(index) {
        return this.remove_child(index);
    }

    get_clip(index) {
        return this.child_at_index(index);
    }

    clip_count() {
        return this.children_count();
    }

    get_effects_count() {
        return this.effects.length;
    }

    get_markers_count() {
        return this.markers.length;
    }

    duration(OTIO) {
        let totalDuration = new OTIO.RationalTime(0, 24);
        for (const child of this.children) {
            if (child.duration && typeof child.duration === 'function') {
                const childDuration = child.duration();
                if (childDuration) {
                    totalDuration = OTIO.add(totalDuration, childDuration);
                }
            }
        }
        return totalDuration;
    }

    get_range_of_child_at_index(index, OTIO) {
        if (index < 0 || index >= this.children.length) return null;
        
        let currentTime = new OTIO.RationalTime(0, 24);
        for (let i = 0; i < index; i++) {
            const child = this.children[i];
            if (child.duration && typeof child.duration === 'function') {
                const childDuration = child.duration();
                if (childDuration) {
                    currentTime = OTIO.add(currentTime, childDuration);
                }
            }
        }
        
        const child = this.children[index];
        const childDuration = child.duration ? child.duration() : new OTIO.RationalTime(0, 24);
        return new OTIO.TimeRange(currentTime, childDuration);
    }

    get_trimmed_range_of_child_at_index(index, OTIO) {
        return this.get_range_of_child_at_index(index, OTIO);
    }

    to_json_string() {
        return JSON.stringify({
            OTIO_SCHEMA: 'Track.1',
            name: this.name, 
            kind: this.kind,
            children: this.children.map(child => JSON.parse(child.to_json_string()))
        });
    }
}

// Stack class (for managing tracks)
class Stack extends OTIOObject {
    constructor(name) {
        super();
        this.name = name || '';
        this.children = [];
    }

    append_child(child) {
        this.children.push(child);
    }

    insert_child(index, child) {
        this.children.splice(index, 0, child);
    }

    remove_child(index) {
        if (index >= 0 && index < this.children.length) {
            return this.children.splice(index, 1)[0];
        }
        return null;
    }

    child_at_index(index) {
        return this.children[index] || null;
    }

    children_count() {
        return this.children.length;
    }

    // Convenience methods for tracks
    add_track(track) {
        this.append_child(track);
    }

    insert_track(index, track) {
        this.insert_child(index, track);
    }

    remove_track(index) {
        return this.remove_child(index);
    }

    get_track(index) {
        return this.child_at_index(index);
    }

    track_count() {
        return this.children_count();
    }

    to_json_string() {
        return JSON.stringify({
            OTIO_SCHEMA: 'Stack.1',
            name: this.name,
            children: this.children.map(child => JSON.parse(child.to_json_string()))
        });
    }
}

// Timeline class
class Timeline extends OTIOObject {
    constructor(name, globalStartTime) {
        super();
        this.name = name || '';
        this.globalStartTime = globalStartTime || null;
        this.tracks_stack = new Stack('tracks');
    }

    tracks() {
        return this.tracks_stack;
    }

    add_track(track) {
        this.tracks_stack.add_track(track);
    }

    insert_track(index, track) {
        this.tracks_stack.insert_track(index, track);
    }

    remove_track(index) {
        return this.tracks_stack.remove_track(index);
    }

    get_track(index) {
        return this.tracks_stack.get_track(index);
    }

    track_count() {
        return this.tracks_stack.track_count();
    }

    get_audio_tracks() {
        return this.tracks_stack.children.filter(track => track.kind === 'Audio');
    }

    get_video_tracks() {
        return this.tracks_stack.children.filter(track => track.kind === 'Video');
    }

    get_global_start_time() {
        return this.globalStartTime;
    }

    set_global_start_time(startTime) {
        this.globalStartTime = startTime;
    }

    duration(OTIO) {
        return this.tracks_stack.duration ? this.tracks_stack.duration(OTIO) : new OTIO.RationalTime(0, 24);
    }

    // Timeline editing operations
    overwrite_clip(track_index, clip, time) {
        const track = this.get_track(track_index);
        if (track) {
            track.append_clip(clip);
        }
    }

    insert_clip(track_index, clip, time) {
        const track = this.get_track(track_index);
        if (track) {
            track.insert_clip(0, clip);
        }
    }

    slice_at_time(time) {
        // Simple implementation - would need more sophisticated logic for real editing
        return true;
    }

    to_json_string() {
        return JSON.stringify({
            OTIO_SCHEMA: 'Timeline.1',
            name: this.name,
            global_start_time: this.globalStartTime ? {
                OTIO_SCHEMA: 'RationalTime.1',
                rate: this.globalStartTime.rate(),
                value: this.globalStartTime.value()
            } : null,
            tracks: JSON.parse(this.tracks_stack.to_json_string())
        });
    }
}

// Helper function to automatically wrap objects
function wrapObject(handle, OTIO) {
    // This would be extended to handle different object types
    // For now, return null since we're using pure JS objects
    return null;
}

// Export classes for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Timeline,
        Track,
        Clip,
        ExternalReference,
        Gap,
        Stack,
        wrapObject
    };
} else {
    // Browser environment
    window.OTIOWrappers = {
        Timeline,
        Track,
        Clip, 
        ExternalReference,
        Gap,
        Stack,
        wrapObject
    };
} 