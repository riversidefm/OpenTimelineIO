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
  
  // Simple test functions to verify the bindings work
  export function get_version(): string;
  export function test_connection(): boolean;
  
  // Note: Full OTIO class bindings are commented out due to protected destructor issues
  // This is a foundational implementation that can be expanded once those issues are resolved
  
  // Operator functions for RationalTime
  export function add(a: RationalTime, b: RationalTime): RationalTime;
  export function subtract(a: RationalTime, b: RationalTime): RationalTime;
} 