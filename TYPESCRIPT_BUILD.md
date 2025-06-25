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

3. **Install Node.js** (for NPM package commands)
   ```bash
   node --version
   npm --version
   ```

## Building the TypeScript Bindings

### Step 1: Build WASM Modules

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

### Step 2: Prepare NPM Package

3. **Copy WASM files to package directory**
   ```bash
   cd src/ts-opentimelineio/typescript
   npm run build
   ```

4. **(Optional) Test the package**
   ```bash
   npm pack --dry-run
   ```

5. **(Optional) Install locally for testing**
   ```bash
   npm pack
   npm install -g ./riversidefm-opentimelineio-1.0.0.tgz
   ```

## Output Files

The build process generates files in two locations:

### WASM Build Output
- `build-wasm/src/ts-opentimelineio/opentime-bindings/opentime.js` / `opentime.wasm` - OpenTime bindings
- `build-wasm/src/ts-opentimelineio/opentimelineio-bindings/opentimelineio.js` / `opentimelineio.wasm` - Main OpenTimelineIO bindings

### NPM Package Files
- `src/ts-opentimelineio/typescript/dist/` - Generated WASM files (copied from build)
- `src/ts-opentimelineio/typescript/index.js` - Main entry point
- `src/ts-opentimelineio/typescript/index.d.ts` - TypeScript definitions
- `src/ts-opentimelineio/typescript/wrappers.js` - JavaScript wrapper classes
- `src/ts-opentimelineio/typescript/package.json` - NPM package configuration

## Using the Built Bindings

### Via NPM Package (Recommended)

```bash
npm install @riversidefm/opentimelineio
```

#### Node.js Usage
```javascript
const initializeOTIO = require('@riversidefm/opentimelineio');

async function main() {
  // Initialize the modules
  const { OpenTime, OTIO } = await initializeOTIO();
  
  // Create a timeline
  const timeline = new OTIO.Timeline("My Project");
  
  // Create time values
  const time = new OpenTime.RationalTime(24, 24);
  console.log(`Time: ${time.value()}/${time.rate()}`);
  
  // Clean up
  timeline.dispose();
}

main().catch(console.error);
```

#### Browser Usage
```html
<script src="node_modules/@riversidefm/opentimelineio/dist/opentime.js"></script>
<script src="node_modules/@riversidefm/opentimelineio/dist/opentimelineio.js"></script>
<script src="node_modules/@riversidefm/opentimelineio/wrappers.js"></script>

<script>
async function main() {
  // Initialize modules
  const OpenTime = await window.OpenTimeModule();
  const OTIO = await window.OpenTimelineIOModule();
  window.Module = OTIO;
  
  // Use the API
  const timeline = new window.OTIO.Timeline("My Project");
  console.log(timeline.name());
  
  timeline.dispose();
}
main();
</script>
```

### Direct WASM Usage (Development)

#### Node.js
```javascript
// Load both WASM modules directly from build
const OpenTimeModule = require('./build-wasm/src/ts-opentimelineio/opentime-bindings/opentime.js');
const OpenTimelineIOModule = require('./build-wasm/src/ts-opentimelineio/opentimelineio-bindings/opentimelineio.js');

// Load wrapper classes
require('./src/ts-opentimelineio/typescript/wrappers.js');

async function main() {
  const openTimeInstance = await OpenTimeModule();
  const otioInstance = await OpenTimelineIOModule();
  
  global.Module = otioInstance;
  
  const timeline = new global.OTIO.Timeline("My Timeline");
  timeline.dispose();
}
```

#### Browser
```html
<script src="build-wasm/src/ts-opentimelineio/opentime-bindings/opentime.js"></script>
<script src="build-wasm/src/ts-opentimelineio/opentimelineio-bindings/opentimelineio.js"></script>
<script src="src/ts-opentimelineio/typescript/wrappers.js"></script>

<script>
async function main() {
  const OpenTimeModule = await window.OpenTimeModule();
  const OTIOModule = await window.OpenTimelineIOModule();
  window.Module = OTIOModule;
  
  const timeline = new OTIO.Timeline("My Timeline");
  timeline.dispose();
}
</script>
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
7. **Package Updates**: Run `npm run build` after changing WASM builds to update the package

## NPM Package Commands

```bash
# Copy WASM files to package (run after cmake build)
cd src/ts-opentimelineio/typescript
npm run build

# Check package contents
npm pack --dry-run

# Test package locally
npm pack
npm install -g ./riversidefm-opentimelineio-1.0.0.tgz

# Publish to GitHub Packages (requires NPM_TOKEN)
export NPM_TOKEN=your_github_personal_access_token
npm publish
```

## Troubleshooting

### Build Issues

- **Emscripten not found**: Make sure you've sourced `emsdk_env.sh`
- **Missing dependencies**: Ensure all submodules are updated: `git submodule update --init --recursive`
- **CMake errors**: Try cleaning the build directory: `rm -rf build-wasm`
- **NPM build fails**: Make sure WASM build completed successfully first

### Runtime Issues

- **Module loading fails**: Check browser console for WASM loading errors
- **Functions not found**: Verify the binding exports in the generated `.js` file
- **Memory issues**: The WASM module may need time to initialize
- **"OTIO is not defined"**: Make sure you've loaded the wrapper classes (`wrappers.js`) after loading both WASM modules
- **"Module is not defined"**: Ensure you've set `window.Module` (browser) or `global.Module` (Node.js) to the OpenTimelineIO module instance
- **Disposal errors**: Always call `dispose()` on objects when done to avoid memory leaks and runtime errors
- **Package not found**: Make sure you've run `npm run build` after building WASM modules

### Package Issues

- **Files missing from package**: Check `package.json` `files` array includes `dist/`
- **Wrong file paths**: Ensure all imports use `./dist/` for WASM files
- **Git conflicts**: The `dist/` folder is gitignored - only committed source files should be tracked

## Testing

### Prerequisites: Rebuild After Changes
When changes are made to the C++ bindings or wrapper code, always rebuild before testing:


```bash
emcmake cmake -B build-wasm -S . -DOTIO_TYPESCRIPT_INSTALL=ON
cmake --build build-wasm
cd src/ts-opentimelineio/typescript
npm run build
cd ../../../
```

### Running Browser Tests
To test the TypeScript bindings, serve the test files over HTTP (WASM modules cannot be loaded from `file://` URLs):

1. **Start HTTP Server from project root:**
   ```bash
   npx http-server -p 8000
   ```

2. **Open test pages in browser:**
   - `http://localhost:8000/tests-web/test_composition.html` - **Primary test suite** with full composition and advanced editing operations
   - `http://localhost:8000/tests-web/test_typescript_bindings.html` - Basic bindings test (if available)

### Expected Test Results
A successful test run should show:
- ✅ Both WASM modules loading without errors
- ✅ Timeline creation and track management
- ✅ Clip creation and time range operations
- ✅ Advanced editing operations (overwrite, insert, slice, trim, slip, slide)
- ✅ Gap creation and management
- ✅ Type conversion between OpenTime and OTIO formats
- ✅ JSON serialization and object introspection
- ✅ Proper object disposal without "table index out of bounds" errors

### Troubleshooting Test Issues
- **WASM loading errors**: Check browser console and ensure files exist in `dist/` directory
- **"Module.function_name is not a function"**: Rebuild WASM modules - new functions may not be compiled
- **Type conversion errors**: Check for proper OpenTime ↔ OTIO type handling in wrappers
- **Memory disposal errors**: Verify all objects are properly disposed in test cleanup

## Examples

See the following files for usage examples:

- `examples/typescript_example.ts` - Comprehensive TypeScript usage example
- `tests-web/test_typescript_bindings.html` - Browser-based comprehensive test suite
- `tests-web/test_timeline_operations.html` - Browser-based diagnostic test

## Contributing

When adding new bindings:

1. Add the C++ binding code in `src/ts-opentimelineio/`
2. Update the TypeScript definitions in `src/ts-opentimelineio/typescript/index.d.ts`
3. Rebuild WASM: `cmake --build build-wasm`
4. Update package: `cd src/ts-opentimelineio/typescript && npm run build`
5. Test the bindings with both Node.js and browser environments
6. Update this documentation as needed 