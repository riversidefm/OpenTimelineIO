// SPDX-License-Identifier: Apache-2.0
// Copyright Contributors to the OpenTimelineIO project

declare module 'opentimelineio' {
  // OpenTime types
  export class RationalTime {
    constructor();
    constructor(value: number);
    constructor(value: number, rate: number);
    
    value(): number;
    rate(): number;
    is_invalid_time(): boolean;
    rescaled_to(rate: number): RationalTime;
    rescaled_to(other: RationalTime): RationalTime;
    value_rescaled_to(rate: number): number;
    value_rescaled_to(other: RationalTime): number;
    almost_equal(other: RationalTime, delta?: number): boolean;
    
    static duration_from_start_end_time(start: RationalTime, end: RationalTime): RationalTime;
    static duration_from_start_end_time_inclusive(start: RationalTime, end: RationalTime): RationalTime;
    static from_frames(frame: number, rate: number): RationalTime;
    static from_seconds(seconds: number): RationalTime;
    static from_seconds(seconds: number, rate: number): RationalTime;
    static from_timecode(timecode: string, rate: number): RationalTime;
  }
  
  export class TimeRange {
    constructor();
    constructor(start_time: RationalTime);
    constructor(start_time: RationalTime, duration: RationalTime);
    
    start_time: RationalTime;
    duration: RationalTime;
    
    end_time_inclusive(): RationalTime;
    end_time_exclusive(): RationalTime;
    duration_extended_by(other: RationalTime): RationalTime;
    extended_by(other: RationalTime): TimeRange;
    clamped(time: RationalTime): TimeRange;
    clamped(range: TimeRange): TimeRange;
    contains(time: RationalTime): boolean;
    contains(range: TimeRange): boolean;
    overlaps(range: TimeRange): boolean;
    intersects(range: TimeRange): boolean;
    
    static range_from_start_end_time(start: RationalTime, end: RationalTime): TimeRange;
    static range_from_start_end_time_inclusive(start: RationalTime, end: RationalTime): TimeRange;
  }
  
  export class TimeTransform {
    constructor();
    constructor(offset: RationalTime);
    constructor(offset: RationalTime, scale: number);
    constructor(offset: RationalTime, scale: number, rate: number);
    
    offset: RationalTime;
    scale: number;
    rate: number;
    
    applied_to(time: RationalTime): RationalTime;
    applied_to(range: TimeRange): TimeRange;
  }
  
  // OpenTimelineIO-specific time types (used internally to avoid conflicts)
  export class OTIORationalTime {
    constructor();
    constructor(value: number);
    constructor(value: number, rate: number);
    
    value(): number;
    rate(): number;
    to_seconds(): number;
    rescaled_to(rate: number): OTIORationalTime;
    almost_equal(other: OTIORationalTime, delta?: number): boolean;
  }
  
  export class OTIOTimeRange {
    constructor();
    constructor(start_time: OTIORationalTime);
    constructor(start_time: OTIORationalTime, duration: OTIORationalTime);
    
    start_time: OTIORationalTime;
    duration: OTIORationalTime;
    
    end_time_inclusive(): OTIORationalTime;
    end_time_exclusive(): OTIORationalTime;
    duration_extended_by(other: OTIORationalTime): OTIORationalTime;
    extended_by(other: OTIORationalTime): OTIOTimeRange;
    contains_time(time: OTIORationalTime): boolean;
  }
  
  export class OTIOTimeTransform {
    constructor();
    constructor(offset: OTIORationalTime);
    constructor(offset: OTIORationalTime, scale: number);
    constructor(offset: OTIORationalTime, scale: number, rate: number);
    
    offset: OTIORationalTime;
    scale: number;
    rate: number;
  }
  
  // Numeric handle types (internal use - these are actually pointers as numbers)
  type Handle = number;
  
  // Factory functions (internal)
  export function create_timeline(name: string): Handle;
  export function create_track(name: string, kind: string): Handle;
  export function create_clip(name: string): Handle;
  export function create_external_reference(target_url: string): Handle;
  export function create_stack(name: string): Handle;
  
  // Cleanup functions (internal)
  export function delete_timeline(handle: Handle): void;
  export function delete_track(handle: Handle): void;
  export function delete_clip(handle: Handle): void;
  export function delete_external_reference(handle: Handle): void;
  export function delete_stack(handle: Handle): void;
  
  // Timeline utility functions (internal)
  export function timeline_name(handle: Handle): string;
  export function timeline_set_name(handle: Handle, name: string): void;
  export function timeline_to_json_string(handle: Handle): string;
  export function timeline_schema_name(handle: Handle): string;
  export function timeline_schema_version(handle: Handle): number;
  export function timeline_duration(handle: Handle): OTIORationalTime;
  
  // Clip utility functions (internal)
  export function clip_name(handle: Handle): string;
  export function clip_set_name(handle: Handle, name: string): void;
  export function clip_source_range(handle: Handle): OTIOTimeRange;
  export function clip_set_source_range(handle: Handle, range: OTIOTimeRange): void;
  export function clip_duration(handle: Handle): OTIORationalTime;
  export function clip_enabled(handle: Handle): boolean;
  export function clip_set_enabled(handle: Handle, enabled: boolean): void;
  export function clip_to_json_string(handle: Handle): string;
  export function clip_media_reference(handle: Handle): Handle;
  export function clip_set_media_reference(handle: Handle, ref: Handle): void;
  
  // Track utility functions (internal)
  export function track_name(handle: Handle): string;
  export function track_set_name(handle: Handle, name: string): void;
  export function track_kind(handle: Handle): string;
  export function track_set_kind(handle: Handle, kind: string): void;
  export function track_enabled(handle: Handle): boolean;
  export function track_set_enabled(handle: Handle, enabled: boolean): void;
  export function track_to_json_string(handle: Handle): string;
  
  // ExternalReference utility functions (internal)
  export function external_reference_name(handle: Handle): string;
  export function external_reference_set_name(handle: Handle, name: string): void;
  export function external_reference_target_url(handle: Handle): string;
  export function external_reference_set_target_url(handle: Handle, url: string): void;
  export function external_reference_is_missing_reference(handle: Handle): boolean;
  export function external_reference_to_json_string(handle: Handle): string;

  // Composition utility functions (internal)
  export function timeline_tracks(handle: Handle): Handle;
  export function composition_children_count(handle: Handle): number;
  export function composition_child_at_index(handle: Handle, index: number): Handle;
  export function composition_append_child(handle: Handle, childHandle: Handle): boolean;
  export function composition_insert_child(handle: Handle, index: number, childHandle: Handle): boolean;
  export function composition_remove_child(handle: Handle, index: number): boolean;
  export function composition_index_of_child(handle: Handle, childHandle: Handle): number;

  // Stack utility functions (internal)
  export function stack_name(handle: Handle): string;
  export function stack_set_name(handle: Handle, name: string): void;
  export function stack_to_json_string(handle: Handle): string;

  // Helper functions (internal)
  export function get_object_schema_name(handle: Handle): string;
  
  // Public object-oriented wrapper class declarations
  export class Timeline {
    constructor(name?: string);
    name(): string;
    set_name(name: string): void;
    to_json_string(): string;
    schema_name(): string;
    schema_version(): number;
    duration(): OTIORationalTime;
    
    // Timeline composition operations
    tracks(): Stack | null;
    add_track(track: Track): boolean;
    insert_track(index: number, track: Track): boolean;
    remove_track(index: number): boolean;
    get_track(index: number): Track | null;
    track_count(): number;
    
    dispose(): void;
  }
  
  export class Clip {
    constructor(name?: string);
    name(): string;
    set_name(name: string): void;
    source_range(): OTIOTimeRange;
    set_source_range(range: OTIOTimeRange): void;
    duration(): OTIORationalTime;
    enabled(): boolean;
    set_enabled(enabled: boolean): void;
    to_json_string(): string;
    media_reference(): ExternalReference | null;
    set_media_reference(ref: ExternalReference): void;
    dispose(): void;
  }
  
  export class Track {
    constructor(name?: string, kind?: string);
    name(): string;
    set_name(name: string): void;
    kind(): string;
    set_kind(kind: string): void;
    enabled(): boolean;
    set_enabled(enabled: boolean): void;
    to_json_string(): string;
    
    // Track composition operations
    readonly length: number;
    child_at(index: number): Clip | null;
    append(item: Clip): boolean;
    insert(index: number, item: Clip): boolean;
    remove(index: number): boolean;
    index_of(item: Clip): number;
    
    // Convenience methods for clips
    add_clip(clip: Clip): boolean;
    insert_clip(index: number, clip: Clip): boolean;
    remove_clip(index: number): boolean;
    get_clip(index: number): Clip | null;
    clip_count(): number;
    
    dispose(): void;
  }
  
  export class ExternalReference {
    constructor(target_url?: string);
    name(): string;
    set_name(name: string): void;
    target_url(): string;
    set_target_url(url: string): void;
    is_missing_reference(): boolean;
    to_json_string(): string;
    dispose(): void;
  }
  
  export class Stack {
    constructor(name?: string);
    name(): string;
    set_name(name: string): void;
    to_json_string(): string;
    
    // Stack composition operations
    readonly length: number;
    child_at(index: number): Track | null;
    append(item: Track): boolean;
    insert(index: number, item: Track): boolean;
    remove(index: number): boolean;
    index_of(item: Track): number;
    
    dispose(): void;
  }
  
  // Test functions
  export function get_version(): string;
  export function test_connection(): boolean;
  
  // Operator functions for RationalTime (OpenTime module)
  export function add(a: RationalTime, b: RationalTime): RationalTime;
  export function subtract(a: RationalTime, b: RationalTime): RationalTime;
  
  // Operator functions for OTIORationalTime (OpenTimelineIO module)
  export function otio_add(a: OTIORationalTime, b: OTIORationalTime): OTIORationalTime;
  export function otio_subtract(a: OTIORationalTime, b: OTIORationalTime): OTIORationalTime;
} 