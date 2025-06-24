# Building OpenTimelineIO TypeScript Bindings

This guide explains how to build the TypeScript/JavaScript bindings for OpenTimelineIO using Emscripten and WebAssembly.

## Prerequisites

1. **Install Emscripten SDK**
   ```bash
   git clone https://github.com/emscripten-core/emsdk.git
   cd emsdk
   ./emsdk install latest
   ./emsdk activate latest
   source ./emsdk_env.sh
   ```

2. **Verify Emscripten Installation**
   ```bash
   emcc --version
   ```

## Building the TypeScript Bindings

1. **Configure the build with Emscripten**
   ```bash
   emcmake cmake -B build-wasm -S . -DOTIO_TYPESCRIPT_INSTALL=ON
   ```

   Optional CMake flags:
   - `-DOTIO_TYPESCRIPT_INSTALL_DIR=/path/to/install` - Custom install directory
   - `-DCMAKE_BUILD_TYPE=Release` - Release build (recommended for production)
   - `-DOTIO_INSTALL_TYPESCRIPT_MODULES=ON` - Install TypeScript definition files (default: ON)

2. **Build the project**
   ```bash
   cmake --build build-wasm
   ```

3. **Install (optional)**
   ```bash
   cmake --install build-wasm
   ```

## Output Files

The build will generate several files in the build directory:

- `build-wasm/src/ts-opentimelineio/opentime-bindings/opentime.js` / `opentime.wasm` - OpenTime bindings
- `build-wasm/src/ts-opentimelineio/opentimelineio-bindings/opentimelineio.js` / `opentimelineio.wasm` - Main OpenTimelineIO bindings
- `src/ts-opentimelineio/typescript/index.d.ts` - TypeScript definitions
- `src/ts-opentimelineio/typescript/package.json` - NPM package configuration
- `src/ts-opentimelineio/typescript/wrappers.js` - JavaScript wrapper classes (required for object-oriented API)

## Using the Built Bindings

### In Node.js

```javascript
// Load both WASM modules
const OpenTimeModule = require('./build-wasm/src/ts-opentimelineio/opentime-bindings/opentime.js');
const OpenTimelineIOModule = require('./build-wasm/src/ts-opentimelineio/opentimelineio-bindings/opentimelineio.js');

// Load wrapper classes
require('./src/ts-opentimelineio/typescript/wrappers.js');

async function main() {
  // Initialize both modules
  const openTimeInstance = await OpenTimeModule();
  const otioInstance = await OpenTimelineIOModule();
  
  // Set global Module for wrapper classes
  global.Module = otioInstance;
  
  // Use the object-oriented API
  const timeline = new global.OTIO.Timeline("My Timeline");
  console.log(timeline.name()); // "My Timeline"
  
  // Create time objects
  const time = new openTimeInstance.RationalTime(24, 24);
  console.log(`Time: ${time.value()}/${time.rate()}`);
  
  // Clean up
  timeline.dispose();
}

main().catch(console.error);
```

### In a Web Browser

```html
<!-- Load the WASM modules -->
<script src="build-wasm/src/ts-opentimelineio/opentime-bindings/opentime.js"></script>
<script src="build-wasm/src/ts-opentimelineio/opentimelineio-bindings/opentimelineio.js"></script>
<!-- Load the wrapper classes -->
<script src="src/ts-opentimelineio/typescript/wrappers.js"></script>

<script>
  async function initializeOTIO() {
    // Initialize both modules
    const OpenTimeModule = await window.OpenTimeModule();
    const OTIOModule = await window.OpenTimelineIOModule();
    
    // Set the global Module for wrapper classes
    window.Module = OTIOModule;
    
    // Now you can use the object-oriented API
    const timeline = new OTIO.Timeline("My Timeline");
    console.log(timeline.name()); // "My Timeline"
    
    // Create time objects using OpenTime module
    const time = new OpenTimeModule.RationalTime(24, 24);
    console.log(`Time: ${time.value()}/${time.rate()}`);
    
    // Clean up when done
    timeline.dispose();
  }
  
  initializeOTIO();
</script>
```

### With TypeScript

```typescript
import { Timeline, RationalTime, TimeRange } from './src/ts-opentimelineio/typescript/index.d.ts';

// Load both WASM modules
const OpenTimeModule = await import('./build-wasm/src/ts-opentimelineio/opentime-bindings/opentime.js');
const OpenTimelineIOModule = await import('./build-wasm/src/ts-opentimelineio/opentimelineio-bindings/opentimelineio.js');

// Initialize modules
const openTimeInstance = await OpenTimeModule.default();
const otioInstance = await OpenTimelineIOModule.default();

// Load wrapper classes (ensure they're available)
await import('./src/ts-opentimelineio/typescript/wrappers.js');

// Set global Module for wrapper classes
(globalThis as any).Module = otioInstance;

// Now you have type-safe access
const timeline = new (globalThis as any).OTIO.Timeline("My Timeline");
const time = new openTimeInstance.RationalTime(24, 24);

// Remember to clean up
timeline.dispose();
```

## Architecture Overview

The TypeScript bindings use a two-layer architecture:

1. **WASM Layer**: Direct C++ bindings that expose factory functions and utility functions
2. **Wrapper Layer**: JavaScript wrapper classes that provide an object-oriented API

This design works around OpenTimelineIO's reference counting system where core classes have protected destructors.

## Development Tips

1. **Debug Builds**: Use `-DCMAKE_BUILD_TYPE=Debug` for development
2. **Size Optimization**: For production, consider using `-Os` optimization
3. **Memory**: The WASM modules use `ALLOW_MEMORY_GROWTH=1` for dynamic memory allocation
4. **Exception Handling**: Exception catching is enabled (`DISABLE_EXCEPTION_CATCHING=0`)
5. **Memory Management**: Always call `dispose()` on wrapper objects when done to prevent memory leaks
6. **Module Loading**: Load OpenTime module for time operations, OpenTimelineIO module for OTIO classes, and wrapper classes for the object-oriented API

## Troubleshooting

### Build Issues

- **Emscripten not found**: Make sure you've sourced `emsdk_env.sh`
- **Missing dependencies**: Ensure all submodules are updated: `git submodule update --init --recursive`
- **CMake errors**: Try cleaning the build directory: `rm -rf build-wasm`

### Runtime Issues

- **Module loading fails**: Check browser console for WASM loading errors
- **Functions not found**: Verify the binding exports in the generated `.js` file
- **Memory issues**: The WASM module may need time to initialize
- **"OTIO is not defined"**: Make sure you've loaded the wrapper classes (`wrappers.js`) after loading both WASM modules
- **"Module is not defined"**: Ensure you've set `window.Module` (browser) or `global.Module` (Node.js) to the OpenTimelineIO module instance
- **Disposal errors**: Always call `dispose()` on objects when done to avoid memory leaks and runtime errors

## Testing

To test the TypeScript bindings, you need to serve the test files over HTTP (WASM modules cannot be loaded from `file://` URLs).

Start a simple HTTP server from the project root:
```bash
npx http-server -p 8000
```

Then open your browser and navigate to:
- `http://localhost:8000/tests-web/test_typescript_bindings.html` - Comprehensive test suite
- `http://localhost:8000/tests-web/test_timeline_operations.html` - Diagnostic test

## Examples

See the following files for usage examples:

- `examples/typescript_example.ts` - Comprehensive TypeScript usage example
- `tests-web/test_typescript_bindings.html` - Browser-based comprehensive test suite
- `tests-web/test_timeline_operations.html` - Browser-based diagnostic test

## Contributing

When adding new bindings:

1. Add the C++ binding code in `src/ts-opentimelineio/`
2. Update the TypeScript definitions in `src/ts-opentimelineio/typescript/index.d.ts`
3. Test the bindings with both Node.js and browser environments
4. Update this documentation as needed 