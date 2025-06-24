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
    intersection(range: TimeRange): TimeRange;
    
    static range_from_start_end_time(start: RationalTime, end: RationalTime): TimeRange;
    static range_from_start_end_time_inclusive(start: RationalTime, end: RationalTime): TimeRange;
  }
  
  export class TimeTransform {
    constructor();
    constructor(offset: RationalTime);
    constructor(offset: RationalTime, scale: number);
    constructor(offset: RationalTime, scale: number, rate: RationalTime);
    
    offset: RationalTime;
    scale: number;
    rate: RationalTime;
    
    applied_to(time: RationalTime): RationalTime;
    applied_to(range: TimeRange): TimeRange;
  }
  
  // Core OTIO types
  export class SerializableObject {
    schema_name(): string;
    schema_version(): number;
    to_json_string(indent?: number): string;
  }
  
  export class SerializableObjectWithMetadata extends SerializableObject {
    name(): string;
    set_name(name: string): void;
  }
  
  export class Marker extends SerializableObjectWithMetadata {
    constructor(name: string, marked_range: TimeRange, color: string);
    
    color(): string;
    set_color(color: string): void;
    marked_range(): TimeRange;
    set_marked_range(range: TimeRange): void;
  }
  
  export class MediaReference extends SerializableObjectWithMetadata {
    is_missing_reference(): boolean;
  }
  
  export class ExternalReference extends MediaReference {
    constructor(target_url: string);
    
    target_url(): string;
    set_target_url(url: string): void;
  }
  
  export class Composable extends SerializableObjectWithMetadata {
  }
  
  export class Item extends Composable {
    enabled(): boolean;
    set_enabled(enabled: boolean): void;
    source_range(): TimeRange | null;
    set_source_range(range: TimeRange | null): void;
  }
  
  export class Gap extends Item {
    constructor(source_range: TimeRange, name?: string);
  }
  
  export class Clip extends Item {
    constructor(name?: string);
    
    media_reference(): MediaReference | null;
    set_media_reference(ref: MediaReference | null): void;
  }
  
  export class Composition extends Item {
  }
  
  export class Track extends Composition {
    constructor(name?: string);
    
    kind(): string;
    set_kind(kind: string): void;
  }
  
  export class Stack extends Composition {
    constructor(name?: string);
  }
  
  export class Timeline extends SerializableObjectWithMetadata {
    constructor(name?: string);
    
    tracks(): Stack | null;
    set_tracks(stack: Stack | null): void;
    global_start_time(): RationalTime | null;
    set_global_start_time(time: RationalTime | null): void;
  }
  
  // Utility functions
  export function serialize_json_to_string(obj: any, indent?: number): string;
  export function deserialize_json_from_string(json: string): any;
  
  // Operator functions for RationalTime
  export function add(a: RationalTime, b: RationalTime): RationalTime;
  export function subtract(a: RationalTime, b: RationalTime): RationalTime;
  export function multiply(a: RationalTime, b: number): RationalTime;
  export function divide(a: RationalTime, b: number): RationalTime;
} 