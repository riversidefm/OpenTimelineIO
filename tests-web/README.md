# OpenTimelineIO Web Tests

This directory contains end-to-end tests for the OpenTimelineIO TypeScript/WebAssembly bindings using Playwright.

## 🚀 Quick Start

### Prerequisites

- Node.js (version 16 or higher)
- Python (for running the local web server)
- Built OpenTimelineIO WASM modules (see [Building](#building))

### Installation

1. Navigate to the tests-web directory:
```bash
cd tests-web
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npm run install-browsers
```

### Building WASM Modules

Before running tests, ensure the WASM modules are built:

```bash
# From the project root
mkdir -p build-wasm
cd build-wasm
cmake .. -DOTIO_WASM_BUILD=ON
make -j$(nproc)
```

The tests expect the following files to exist:
- `build-wasm/src/ts-opentimelineio/opentime-bindings/opentime.js`
- `build-wasm/src/ts-opentimelineio/opentimelineio-bindings/opentimelineio.js`
- `src/ts-opentimelineio/typescript/wrappers.js`

## 🧪 Running Tests

### All Tests
```bash
npm test
```

### Specific Test Suites
```bash
# Run only composition tests
npm run test:composition

# Run with browser UI for debugging
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Debug mode with inspector
npm run test:debug
```

### Browser-Specific Tests
```bash
# Run only in Chrome
npx playwright test --project=chromium

# Run only in Firefox
npx playwright test --project=firefox

# Run only in Safari
npx playwright test --project=webkit
```

## 📁 Test Structure

```
tests-web/
├── tests/
│   ├── composition.spec.js           # Timeline composition tests
│   ├── e2e-comprehensive.spec.js     # Full end-to-end test suite
│   └── utils/
│       └── test-helpers.js           # Shared utilities
├── package.json                      # Dependencies and scripts
├── playwright.config.js              # Playwright configuration
└── README.md                         # This file
```

## 🎯 Test Categories

### 1. Module Loading & Initialization
- WASM module loading
- Class availability verification
- Basic functionality checks

### 2. Timeline Composition
- Creating timelines and tracks
- Adding/removing clips
- Clip insertion and reordering
- Timeline structure inspection

### 3. Effect System
- Creating and applying effects
- Effect management on clips
- Effect parameter handling

### 4. Time Operations
- RationalTime calculations
- TimeRange operations
- Frame rate conversions

### 5. Serialization & JSON
- Timeline JSON export
- JSON structure validation
- Roundtrip serialization

### 6. Memory Management
- Object disposal
- Memory leak prevention
- Large object handling

### 7. Stress Testing
- Large timeline performance
- Many clips and tracks
- Bulk operations

## 🔧 Configuration

### Playwright Config (`playwright.config.js`)

Key settings:
- **Web Server**: Automatically starts Python HTTP server on port 8080
- **Browser Args**: Enables SharedArrayBuffer for WASM
- **Cross-Origin**: Handles CORS for local file access
- **Timeouts**: Configured for WASM loading delays

### Package Scripts

- `test`: Run all tests with Playwright
- `test:headed`: Run tests with visible browser
- `test:debug`: Run with Playwright inspector
- `test:composition`: Run specific test file
- `test:ui`: Open Playwright UI mode
- `install-browsers`: Install Playwright browsers

## 🐛 Debugging

### Common Issues

1. **WASM modules not loading**
   ```
   Error: Cannot resolve module './opentime.js'
   ```
   - Ensure WASM build completed successfully
   - Check file paths in `build-wasm/` directory

2. **CORS errors**
   ```
   Access to script blocked by CORS policy
   ```
   - Tests use local HTTP server (port 8080)
   - Browser security requires HTTP protocol for WASM

3. **SharedArrayBuffer errors**
   ```
   ReferenceError: SharedArrayBuffer is not defined
   ```
   - Modern browsers require cross-origin isolation
   - Config includes necessary browser flags

### Debug Mode

Use Playwright's debug mode to step through tests:

```bash
npm run test:debug
```

This opens the Playwright inspector where you can:
- Set breakpoints in test code
- Inspect page state
- Step through test execution
- View browser console

### Screenshots and Videos

Test failures automatically capture:
- Screenshots of the page state
- Video recordings (on failure)
- Console logs and errors
- Network activity

Find these in the `test-results/` directory.

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

The report includes:
- Test execution timeline
- Screenshots of failures
- Error messages and stack traces
- Performance metrics

## 🚀 Continuous Integration

For CI environments, use:

```bash
# Run tests without interactive features
CI=true npm test

# Generate JUnit XML for CI systems
npx playwright test --reporter=junit

# Run in Docker
docker run --rm -v $(pwd):/workspace -w /workspace mcr.microsoft.com/playwright:focal-dev npm test
```

## 📝 Writing New Tests

### Basic Test Structure

```javascript
const { test, expect } = require('@playwright/test');
const { loadOTIOModules, waitForModulesReady } = require('./utils/test-helpers');

test.describe('My New Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('about:blank');
    await loadOTIOModules(page);
    await waitForModulesReady(page);
  });

  test('should test something', async ({ page }) => {
    const result = await page.evaluate(() => {
      // Your test code here
      const timeline = new window.OTIO.Timeline("Test");
      return timeline.name();
    });
    
    expect(result).toBe("Test");
  });
});
```

### Test Utilities

Use the helper functions in `utils/test-helpers.js`:

- `loadOTIOModules(page)`: Load WASM modules
- `waitForModulesReady(page)`: Wait for initialization
- `setupErrorTracking(page, testInfo)`: Track errors
- `createBasicTimeline(page, name)`: Create test timeline
- `verifyModulesWorking(page)`: Verify functionality

### Best Practices

1. **Always clean up objects**: Call `.dispose()` on created objects
2. **Use beforeEach**: Set up clean state for each test
3. **Error handling**: Wrap page.evaluate in try/catch
4. **Descriptive names**: Use clear test and variable names
5. **Assertions**: Include meaningful expect statements

## 🔍 Performance Monitoring

Tests include performance tracking:

```javascript
test('should complete operations quickly', async ({ page }) => {
  const result = await page.evaluate(() => {
    const start = performance.now();
    // ... test operations ...
    const end = performance.now();
    return { duration: end - start };
  });
  
  expect(result.duration).toBeLessThan(1000); // Under 1 second
});
```

## 📈 Future Enhancements

Planned improvements:
- Visual regression testing
- Performance benchmarking
- Cross-browser compatibility matrix
- Integration with existing Python test suite
- Automated test generation from HTML files

## 🤝 Contributing

When adding new tests:

1. Follow existing patterns in `composition.spec.js`
2. Use shared utilities from `test-helpers.js`
3. Include proper cleanup and error handling
4. Add documentation for new test categories
5. Update this README if adding new features

## 📞 Support

For issues with the test suite:
- Check the [OpenTimelineIO documentation](https://opentimelineio.readthedocs.io/)
- Review existing test files for examples
- Open issues in the main OpenTimelineIO repository 