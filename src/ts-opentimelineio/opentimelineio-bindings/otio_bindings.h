// SPDX-License-Identifier: Apache-2.0
// Copyright Contributors to the OpenTimelineIO project

#ifndef OTIO_TS_BINDINGS_H
#define OTIO_TS_BINDINGS_H

#ifdef EMSCRIPTEN
#include <emscripten/bind.h>
#endif

void otio_serializable_object_bindings();

#endif 