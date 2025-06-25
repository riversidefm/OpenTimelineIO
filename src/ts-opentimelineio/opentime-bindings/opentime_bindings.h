// SPDX-License-Identifier: Apache-2.0
// Copyright Contributors to the OpenTimelineIO project

#ifndef OTIO_OPENTIME_TS_BINDINGS_H
#define OTIO_OPENTIME_TS_BINDINGS_H

#ifdef EMSCRIPTEN
#include <emscripten/bind.h>
#endif

#include <string>
#include "opentime/rationalTime.h"
#include "opentime/timeRange.h"
#include "opentime/timeTransform.h"

void opentime_rationalTime_bindings();
void opentime_timeRange_bindings();
void opentime_timeTransform_bindings();

std::string opentime_js_str(opentime::RationalTime rt);
std::string opentime_js_repr(opentime::RationalTime rt);

#endif 