// TypeScript wrapper classes for OpenTimelineIO
// Updated: 2025-06-24 - Added TimeRange conversion support

// Type definitions for the Module object
interface OTIORationalTime {
    value(): number;
    rate(): number;
}

interface OTIOTimeRange {
    start_time: OTIORationalTime;
    duration: OTIORationalTime;
}

interface OpenTimeRationalTime {
    value(): number;
    rate(): number;
}

interface OpenTimeRange {
    start_time: OpenTimeRationalTime;
    duration: OpenTimeRationalTime;
}

type Handle = number;

interface ModuleInterface {
    // OTIO Type constructors
    OTIORationalTime: new (value: number, rate: number) => OTIORationalTime;
    OTIOTimeRange: new (start: OTIORationalTime, duration: OTIORationalTime) => OTIOTimeRange;
    
    // Object utility functions
    get_object_schema_name(handle: Handle): string;
    
    // Timeline functions
    create_timeline(name: string): Handle;
    delete_timeline(handle: Handle): void;
    timeline_name(handle: Handle): string;
    timeline_set_name(handle: Handle, name: string): void;
    timeline_to_json_string(handle: Handle): string;
    timeline_schema_name(handle: Handle): string;
    timeline_schema_version(handle: Handle): number;
    timeline_duration(handle: Handle): OTIORationalTime;
    timeline_tracks(handle: Handle): Handle | null;
    
    // Clip functions
    create_clip(name: string): Handle;
    delete_clip(handle: Handle): void;
    clip_name(handle: Handle): string;
    clip_set_name(handle: Handle, name: string): void;
    clip_source_range(handle: Handle): OTIOTimeRange | null;
    clip_set_source_range(handle: Handle, range: OTIOTimeRange | null): void;
    clip_duration(handle: Handle): OTIORationalTime;
    clip_enabled(handle: Handle): boolean;
    clip_set_enabled(handle: Handle, enabled: boolean): void;
    clip_to_json_string(handle: Handle): string;
    clip_media_reference(handle: Handle): Handle | null;
    clip_set_media_reference(handle: Handle, ref: Handle): void;
    clip_add_effect(handle: Handle, effect: Handle): boolean;
    clip_effects_count(handle: Handle): number;
    clip_get_effect(handle: Handle, index: number): Handle | null;
    clip_remove_effect(handle: Handle, index: number): boolean;
    
    // Track functions
    create_track(name: string, kind: string): Handle;
    delete_track(handle: Handle): void;
    track_name(handle: Handle): string;
    track_set_name(handle: Handle, name: string): void;
    track_kind(handle: Handle): string;
    track_set_kind(handle: Handle, kind: string): void;
    track_enabled(handle: Handle): boolean;
    track_set_enabled(handle: Handle, enabled: boolean): void;
    track_to_json_string(handle: Handle): string;
    
    // External Reference functions
    create_external_reference(url: string): Handle;
    delete_external_reference(handle: Handle): void;
    external_reference_name(handle: Handle): string;
    external_reference_set_name(handle: Handle, name: string): void;
    external_reference_target_url(handle: Handle): string;
    external_reference_set_target_url(handle: Handle, url: string): void;
    external_reference_is_missing_reference(handle: Handle): boolean;
    external_reference_to_json_string(handle: Handle): string;
    
    // Stack functions
    create_stack(name: string): Handle;
    delete_stack(handle: Handle): void;
    stack_name(handle: Handle): string;
    stack_set_name(handle: Handle, name: string): void;
    stack_to_json_string(handle: Handle): string;
    
    // Effect functions
    create_effect(name: string, effect_name: string): Handle;
    delete_effect(handle: Handle): void;
    effect_name(handle: Handle): string;
    effect_set_name(handle: Handle, name: string): void;
    effect_effect_name(handle: Handle): string;
    effect_set_effect_name(handle: Handle, effect_name: string): void;
    effect_enabled(handle: Handle): boolean;
    effect_set_enabled(handle: Handle, enabled: boolean): void;
    effect_to_json_string(handle: Handle): string;
    
    // Composition functions
    composition_children_count(handle: Handle): number;
    composition_child_at_index(handle: Handle, index: number): Handle | null;
    composition_append_child(handle: Handle, child: Handle): boolean;
    composition_insert_child(handle: Handle, index: number, child: Handle): boolean;
    composition_remove_child(handle: Handle, index: number): boolean;
    composition_index_of_child(handle: Handle, child: Handle): number;
}

declare const Module: ModuleInterface;

// Helper function to convert OpenTime types to OTIO types
function convertTimeRange(openTimeRange: OpenTimeRange): OTIOTimeRange | null {
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

function convertRationalTime(openTimeRationalTime: OpenTimeRationalTime): OTIORationalTime | null {
    if (!openTimeRationalTime) return null;
    
    return new Module.OTIORationalTime(
        openTimeRationalTime.value(), 
        openTimeRationalTime.rate()
    );
}

// Helper function to wrap handles back into proper wrapper classes
function wrapObject(handle: Handle | null): Timeline | Track | Clip | Stack | ExternalReference | Effect | null {
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
        case 'Effect.1':
        case 'Effect':
            return Effect._fromHandle(handle);
        default:
            console.warn('Unknown schema type:', schemaName);
            return null;
    }
}

export class Timeline {
    private _handle: Handle | null;
    
    constructor(name: string = "") {
        this._handle = Module.create_timeline(name);
    }
    
    static _fromHandle(handle: Handle): Timeline {
        const timeline = Object.create(Timeline.prototype);
        timeline._handle = handle;
        return timeline;
    }
    
    _getHandle(): Handle | null {
        return this._handle;
    }
    
    name(): string {
        if (!this._handle) throw new Error("Timeline has been disposed");
        return Module.timeline_name(this._handle);
    }
    
    set_name(name: string): void {
        if (!this._handle) throw new Error("Timeline has been disposed");
        Module.timeline_set_name(this._handle, name);
    }
    
    to_json_string(): string {
        if (!this._handle) throw new Error("Timeline has been disposed");
        return Module.timeline_to_json_string(this._handle);
    }
    
    schema_name(): string {
        if (!this._handle) throw new Error("Timeline has been disposed");
        return Module.timeline_schema_name(this._handle);
    }
    
    schema_version(): number {
        if (!this._handle) throw new Error("Timeline has been disposed");
        return Module.timeline_schema_version(this._handle);
    }
    
    duration(): OTIORationalTime {
        if (!this._handle) throw new Error("Timeline has been disposed");
        return Module.timeline_duration(this._handle);
    }
    
    // Timeline composition operations
    tracks(): Stack | null {
        if (!this._handle) throw new Error("Timeline has been disposed");
        const tracksHandle = Module.timeline_tracks(this._handle);
        return tracksHandle ? Stack._fromHandle(tracksHandle) : null;
    }
    
    add_track(track: Track): boolean {
        const tracks = this.tracks();
        return tracks ? tracks.append(track) : false;
    }
    
    insert_track(index: number, track: Track): boolean {
        const tracks = this.tracks();
        return tracks ? tracks.insert(index, track) : false;
    }
    
    remove_track(index: number): boolean {
        const tracks = this.tracks();
        return tracks ? tracks.remove(index) : false;
    }
    
    get_track(index: number): Track | null {
        const tracks = this.tracks();
        return tracks ? (tracks.child_at(index) as Track) : null;
    }
    
    track_count(): number {
        const tracks = this.tracks();
        return tracks ? tracks.length : 0;
    }
    
    dispose(): void {
        if (this._handle && this._handle !== 0) {
            try {
                console.log('Disposing timeline with handle:', this._handle);
                Module.delete_timeline(this._handle);
                this._handle = null;
            } catch (error) {
                console.warn('Error disposing timeline:', error);
                this._handle = null; // Mark as disposed even if error
            }
        }
    }
}

export class Clip {
    private _handle: Handle | null;
    
    constructor(name: string = "") {
        this._handle = Module.create_clip(name);
    }
    
    static _fromHandle(handle: Handle): Clip {
        const clip = Object.create(Clip.prototype);
        clip._handle = handle;
        return clip;
    }
    
    _getHandle(): Handle | null {
        return this._handle;
    }
    
    name(): string {
        if (!this._handle) throw new Error("Clip has been disposed");
        return Module.clip_name(this._handle);
    }
    
    set_name(name: string): void {
        if (!this._handle) throw new Error("Clip has been disposed");
        Module.clip_set_name(this._handle, name);
    }
    
    source_range(): OTIOTimeRange | null {
        if (!this._handle) throw new Error("Clip has been disposed");
        return Module.clip_source_range(this._handle);
    }
    
    set_source_range(range: OTIOTimeRange | OpenTimeRange | null): void {
        if (!this._handle) throw new Error("Clip has been disposed");
        
        // Auto-convert OpenTime TimeRange to OTIO TimeRange if needed
        let otioRange: OTIOTimeRange | null = range as OTIOTimeRange | null;
        
        // Check if this is an OpenTime TimeRange (has start_time and duration properties)
        if (range && 'start_time' in range && 'duration' in range && 
            typeof range.start_time.value === 'function' && 
            typeof range.duration.value === 'function') {
            
            console.log('Converting OpenTime TimeRange to OTIO TimeRange');
            otioRange = convertTimeRange(range as OpenTimeRange);
        }
        
        Module.clip_set_source_range(this._handle, otioRange);
    }
    
    duration(): OTIORationalTime {
        if (!this._handle) throw new Error("Clip has been disposed");
        return Module.clip_duration(this._handle);
    }
    
    enabled(): boolean {
        if (!this._handle) throw new Error("Clip has been disposed");
        return Module.clip_enabled(this._handle);
    }
    
    set_enabled(enabled: boolean): void {
        if (!this._handle) throw new Error("Clip has been disposed");
        Module.clip_set_enabled(this._handle, enabled);
    }
    
    to_json_string(): string {
        if (!this._handle) throw new Error("Clip has been disposed");
        return Module.clip_to_json_string(this._handle);
    }
    
    media_reference(): ExternalReference | null {
        if (!this._handle) throw new Error("Clip has been disposed");
        const refHandle = Module.clip_media_reference(this._handle);
        return refHandle ? ExternalReference._fromHandle(refHandle) : null;
    }
    
    set_media_reference(ref: ExternalReference): void {
        if (!this._handle) throw new Error("Clip has been disposed");
        const refHandle = ref._getHandle();
        if (!refHandle) throw new Error("External reference has been disposed");
        Module.clip_set_media_reference(this._handle, refHandle);
    }
    
    // Effect management methods
    add_effect(effect: Effect): boolean {
        if (!this._handle) throw new Error("Clip has been disposed");
        const effectHandle = effect._getHandle();
        if (!effectHandle) throw new Error("Effect has been disposed");
        return Module.clip_add_effect(this._handle, effectHandle);
    }
    
    effect_count(): number {
        if (!this._handle) throw new Error("Clip has been disposed");
        return Module.clip_effects_count(this._handle);
    }
    
    get_effect(index: number): Effect | null {
        if (!this._handle) throw new Error("Clip has been disposed");
        const effectHandle = Module.clip_get_effect(this._handle, index);
        return effectHandle ? Effect._fromHandle(effectHandle) : null;
    }
    
    remove_effect(index: number): boolean {
        if (!this._handle) throw new Error("Clip has been disposed");
        return Module.clip_remove_effect(this._handle, index);
    }
    
    dispose(): void {
        if (this._handle && this._handle !== 0) {
            try {
                console.log('Disposing clip with handle:', this._handle);
                Module.delete_clip(this._handle);
                this._handle = null;
            } catch (error) {
                console.warn('Error disposing clip:', error);
                this._handle = null; // Mark as disposed even if error
            }
        }
    }
}

export class Track {
    private _handle: Handle | null;
    
    constructor(name: string = "", kind: string = "Video") {
        this._handle = Module.create_track(name, kind);
    }
    
    static _fromHandle(handle: Handle): Track {
        const track = Object.create(Track.prototype);
        track._handle = handle;
        return track;
    }
    
    _getHandle(): Handle | null {
        return this._handle;
    }
    
    name(): string {
        if (!this._handle) throw new Error("Track has been disposed");
        return Module.track_name(this._handle);
    }
    
    set_name(name: string): void {
        if (!this._handle) throw new Error("Track has been disposed");
        Module.track_set_name(this._handle, name);
    }
    
    kind(): string {
        if (!this._handle) throw new Error("Track has been disposed");
        return Module.track_kind(this._handle);
    }
    
    set_kind(kind: string): void {
        if (!this._handle) throw new Error("Track has been disposed");
        Module.track_set_kind(this._handle, kind);
    }
    
    enabled(): boolean {
        if (!this._handle) throw new Error("Track has been disposed");
        return Module.track_enabled(this._handle);
    }
    
    set_enabled(enabled: boolean): void {
        if (!this._handle) throw new Error("Track has been disposed");
        Module.track_set_enabled(this._handle, enabled);
    }
    
    to_json_string(): string {
        if (!this._handle) throw new Error("Track has been disposed");
        return Module.track_to_json_string(this._handle);
    }
    
    // Track composition operations (Track inherits from Composition)
    get length(): number {
        if (!this._handle) throw new Error("Track has been disposed");
        return Module.composition_children_count(this._handle);
    }
    
    child_at(index: number): Timeline | Track | Clip | Stack | ExternalReference | Effect | null {
        if (!this._handle) throw new Error("Track has been disposed");
        const childHandle = Module.composition_child_at_index(this._handle, index);
        return wrapObject(childHandle);
    }
    
    append(item: Timeline | Track | Clip | Stack | ExternalReference | Effect): boolean {
        if (!this._handle) throw new Error("Track has been disposed");
        const itemHandle = item._getHandle();
        if (!itemHandle) throw new Error("Item has been disposed");
        return Module.composition_append_child(this._handle, itemHandle);
    }
    
    insert(index: number, item: Timeline | Track | Clip | Stack | ExternalReference | Effect): boolean {
        if (!this._handle) throw new Error("Track has been disposed");
        const itemHandle = item._getHandle();
        if (!itemHandle) throw new Error("Item has been disposed");
        return Module.composition_insert_child(this._handle, index, itemHandle);
    }
    
    remove(index: number): boolean {
        if (!this._handle) throw new Error("Track has been disposed");
        return Module.composition_remove_child(this._handle, index);
    }
    
    index_of(item: Timeline | Track | Clip | Stack | ExternalReference | Effect): number {
        if (!this._handle) throw new Error("Track has been disposed");
        const itemHandle = item._getHandle();
        if (!itemHandle) throw new Error("Item has been disposed");
        return Module.composition_index_of_child(this._handle, itemHandle);
    }
    
    // Convenience methods for clips
    add_clip(clip: Clip): boolean {
        return this.append(clip);
    }
    
    insert_clip(index: number, clip: Clip): boolean {
        return this.insert(index, clip);
    }
    
    remove_clip(index: number): boolean {
        return this.remove(index);
    }
    
    get_clip(index: number): Timeline | Track | Clip | Stack | ExternalReference | Effect | null {
        return this.child_at(index);
    }
    
    clip_count(): number {
        return this.length;
    }
    
    dispose(): void {
        if (this._handle && this._handle !== 0) {
            try {
                console.log('Disposing track with handle:', this._handle);
                Module.delete_track(this._handle);
                this._handle = null;
            } catch (error) {
                console.warn('Error disposing track:', error);
                this._handle = null; // Mark as disposed even if error
            }
        }
    }
}

export class ExternalReference {
    private _handle: Handle | null;
    
    constructor(target_url: string = "") {
        this._handle = Module.create_external_reference(target_url);
    }
    
    static _fromHandle(handle: Handle): ExternalReference {
        const ref = Object.create(ExternalReference.prototype);
        ref._handle = handle;
        return ref;
    }
    
    _getHandle(): Handle | null {
        return this._handle;
    }
    
    name(): string {
        if (!this._handle) throw new Error("ExternalReference has been disposed");
        return Module.external_reference_name(this._handle);
    }
    
    set_name(name: string): void {
        if (!this._handle) throw new Error("ExternalReference has been disposed");
        Module.external_reference_set_name(this._handle, name);
    }
    
    target_url(): string {
        if (!this._handle) throw new Error("ExternalReference has been disposed");
        return Module.external_reference_target_url(this._handle);
    }
    
    set_target_url(url: string): void {
        if (!this._handle) throw new Error("ExternalReference has been disposed");
        Module.external_reference_set_target_url(this._handle, url);
    }
    
    is_missing_reference(): boolean {
        if (!this._handle) throw new Error("ExternalReference has been disposed");
        return Module.external_reference_is_missing_reference(this._handle);
    }
    
    to_json_string(): string {
        if (!this._handle) throw new Error("ExternalReference has been disposed");
        return Module.external_reference_to_json_string(this._handle);
    }
    
    dispose(): void {
        if (this._handle && this._handle !== 0) {
            try {
                console.log('Disposing external reference with handle:', this._handle);
                Module.delete_external_reference(this._handle);
                this._handle = null;
            } catch (error) {
                console.warn('Error disposing external reference:', error);
                this._handle = null; // Mark as disposed even if error
            }
        }
    }
}

export class Stack {
    private _handle: Handle | null;
    
    constructor(name: string = "") {
        this._handle = Module.create_stack(name);
    }
    
    static _fromHandle(handle: Handle): Stack {
        const stack = Object.create(Stack.prototype);
        stack._handle = handle;
        return stack;
    }
    
    _getHandle(): Handle | null {
        return this._handle;
    }
    
    name(): string {
        if (!this._handle) throw new Error("Stack has been disposed");
        return Module.stack_name(this._handle);
    }
    
    set_name(name: string): void {
        if (!this._handle) throw new Error("Stack has been disposed");
        Module.stack_set_name(this._handle, name);
    }
    
    to_json_string(): string {
        if (!this._handle) throw new Error("Stack has been disposed");
        return Module.stack_to_json_string(this._handle);
    }
    
    // Stack composition operations (Stack inherits from Composition)
    get length(): number {
        if (!this._handle) throw new Error("Stack has been disposed");
        return Module.composition_children_count(this._handle);
    }
    
    child_at(index: number): Timeline | Track | Clip | Stack | ExternalReference | Effect | null {
        if (!this._handle) throw new Error("Stack has been disposed");
        const childHandle = Module.composition_child_at_index(this._handle, index);
        return wrapObject(childHandle);
    }
    
    append(item: Timeline | Track | Clip | Stack | ExternalReference | Effect): boolean {
        if (!this._handle) throw new Error("Stack has been disposed");
        const itemHandle = item._getHandle();
        if (!itemHandle) throw new Error("Item has been disposed");
        return Module.composition_append_child(this._handle, itemHandle);
    }
    
    insert(index: number, item: Timeline | Track | Clip | Stack | ExternalReference | Effect): boolean {
        if (!this._handle) throw new Error("Stack has been disposed");
        const itemHandle = item._getHandle();
        if (!itemHandle) throw new Error("Item has been disposed");
        return Module.composition_insert_child(this._handle, index, itemHandle);
    }
    
    remove(index: number): boolean {
        if (!this._handle) throw new Error("Stack has been disposed");
        return Module.composition_remove_child(this._handle, index);
    }
    
    index_of(item: Timeline | Track | Clip | Stack | ExternalReference | Effect): number {
        if (!this._handle) throw new Error("Stack has been disposed");
        const itemHandle = item._getHandle();
        if (!itemHandle) throw new Error("Item has been disposed");
        return Module.composition_index_of_child(this._handle, itemHandle);
    }
    
    dispose(): void {
        if (this._handle && this._handle !== 0) {
            try {
                console.log('Disposing stack with handle:', this._handle);
                Module.delete_stack(this._handle);
                this._handle = null;
            } catch (error) {
                console.warn('Error disposing stack:', error);
                this._handle = null; // Mark as disposed even if error
            }
        }
    }
}

export class Effect {
    private _handle: Handle | null;
    
    constructor(name: string = "", effect_name: string = "", enabled: boolean = true) {
        this._handle = Module.create_effect(name, effect_name);
        if (enabled !== true) {
            Module.effect_set_enabled(this._handle, enabled);
        }
    }
    
    static _fromHandle(handle: Handle): Effect {
        const effect = Object.create(Effect.prototype);
        effect._handle = handle;
        return effect;
    }
    
    _getHandle(): Handle | null {
        return this._handle;
    }
    
    name(): string {
        if (!this._handle) throw new Error("Effect has been disposed");
        return Module.effect_name(this._handle);
    }
    
    set_name(name: string): void {
        if (!this._handle) throw new Error("Effect has been disposed");
        Module.effect_set_name(this._handle, name);
    }
    
    effect_name(): string {
        if (!this._handle) throw new Error("Effect has been disposed");
        return Module.effect_effect_name(this._handle);
    }
    
    set_effect_name(effect_name: string): void {
        if (!this._handle) throw new Error("Effect has been disposed");
        Module.effect_set_effect_name(this._handle, effect_name);
    }
    
    enabled(): boolean {
        if (!this._handle) throw new Error("Effect has been disposed");
        return Module.effect_enabled(this._handle);
    }
    
    set_enabled(enabled: boolean): void {
        if (!this._handle) throw new Error("Effect has been disposed");
        Module.effect_set_enabled(this._handle, enabled);
    }
    
    to_json_string(): string {
        if (!this._handle) throw new Error("Effect has been disposed");
        return Module.effect_to_json_string(this._handle);
    }
    
    dispose(): void {
        if (this._handle && this._handle !== 0) {
            try {
                console.log('Disposing effect with handle:', this._handle);
                Module.delete_effect(this._handle);
                this._handle = null;
            } catch (error) {
                console.warn('Error disposing effect:', error);
                this._handle = null; // Mark as disposed even if error
            }
        }
    }
}

// Export interface for external use
export interface OTIO {
    Timeline: typeof Timeline;
    Clip: typeof Clip;
    Track: typeof Track;
    ExternalReference: typeof ExternalReference;
    Stack: typeof Stack;
    Effect: typeof Effect;
}

// Export for use in browser environments
declare global {
    interface Window {
        OTIO: OTIO;
    }
}

if (typeof window !== 'undefined') {
    window.OTIO = { Timeline, Clip, Track, ExternalReference, Stack, Effect };
} 