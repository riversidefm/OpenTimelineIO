#!/bin/bash

# OpenTimelineIO Web Tests Setup Script

set -e  # Exit on any error

echo "🎬 OpenTimelineIO Web Tests Setup"
echo "=================================="

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    echo "❌ Error: This script must be run from the tests-web directory"
    echo "Please run: cd tests-web && ./setup.sh"
    exit 1
fi

# Check Node.js version
echo "📦 Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [[ "$NODE_VERSION" -lt 16 ]]; then
    echo "❌ Error: Node.js version $NODE_VERSION detected. Version 16+ required"
    exit 1
fi
echo "✅ Node.js $(node --version) detected"

# Check Python
echo "🐍 Checking Python installation..."
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Error: Python is not installed"
    echo "Please install Python 3.6+ from https://python.org/"
    exit 1
fi

PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi
echo "✅ Python found: $($PYTHON_CMD --version)"

# Install Node.js dependencies
echo "📥 Installing Node.js dependencies..."
npm install

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npx playwright install

# Check for WASM build directory
echo "🔍 Checking for WASM build outputs..."
BUILD_DIR="../build-wasm"
if [[ ! -d "$BUILD_DIR" ]]; then
    echo "⚠️  Warning: $BUILD_DIR directory not found"
    echo "You need to build the WASM modules first:"
    echo ""
    echo "  mkdir -p build-wasm"
    echo "  cd build-wasm"
    echo "  cmake .. -DOTIO_WASM_BUILD=ON"
    echo "  make -j\$(nproc)"
    echo ""
    echo "After building, run the tests with: npm test"
    exit 0
fi

# Check for required WASM files
OPENTIME_JS="$BUILD_DIR/src/ts-opentimelineio/opentime-bindings/opentime.js"
OTIO_JS="$BUILD_DIR/src/ts-opentimelineio/opentimelineio-bindings/opentimelineio.js"
WRAPPERS_JS="../src/ts-opentimelineio/typescript/wrappers.js"

MISSING_FILES=()

if [[ ! -f "$OPENTIME_JS" ]]; then
    MISSING_FILES+=("$OPENTIME_JS")
fi

if [[ ! -f "$OTIO_JS" ]]; then
    MISSING_FILES+=("$OTIO_JS")
fi

if [[ ! -f "$WRAPPERS_JS" ]]; then
    MISSING_FILES+=("$WRAPPERS_JS")
fi

if [[ ${#MISSING_FILES[@]} -gt 0 ]]; then
    echo "❌ Missing required WASM files:"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
    echo ""
    echo "Please rebuild the WASM modules:"
    echo "  cd build-wasm && make -j\$(nproc)"
    exit 1
fi

echo "✅ All required WASM files found"

# Run a quick test to verify everything works
echo "🧪 Running quick verification test..."
npm test -- --reporter=list --max-failures=1 tests/composition.spec.js 2>/dev/null || {
    echo "⚠️  Initial test failed - this is normal if the web server isn't running"
    echo "The setup is complete, but you may need to check your WASM build"
}

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Available commands:"
echo "  npm test                    # Run all tests"
echo "  npm run test:composition    # Run composition tests"
echo "  npm run test:ui            # Open Playwright UI"
echo "  npm run test:headed        # Run with visible browser"
echo "  npm run test:debug         # Debug mode"
echo ""
echo "To run tests now:"
echo "  npm test" 