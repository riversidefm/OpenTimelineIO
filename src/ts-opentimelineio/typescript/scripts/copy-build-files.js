#!/usr/bin/env node

/**
 * Build script to copy WASM files from build directory to package directory
 */

const fs = require('fs');
const path = require('path');

// Paths relative to the script location
const buildDir = path.resolve(__dirname, '../../../../build-wasm/src/ts-opentimelineio');
const packageDir = path.resolve(__dirname, '..');
const distDir = path.join(packageDir, 'dist');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Files to copy
const filesToCopy = [
  {
    from: path.join(buildDir, 'opentime-bindings/opentime.js'),
    to: path.join(distDir, 'opentime.js')
  },
  {
    from: path.join(buildDir, 'opentime-bindings/opentime.wasm'),
    to: path.join(distDir, 'opentime.wasm')
  },
  {
    from: path.join(buildDir, 'opentimelineio-bindings/opentimelineio.js'),
    to: path.join(distDir, 'opentimelineio.js')
  },
  {
    from: path.join(buildDir, 'opentimelineio-bindings/opentimelineio.wasm'),
    to: path.join(distDir, 'opentimelineio.wasm')
  }
];

console.log('Copying WASM build files...');

// Check if build directory exists
if (!fs.existsSync(buildDir)) {
  console.error('Build directory not found:', buildDir);
  console.error('Please run the WASM build first:');
  console.error('  emcmake cmake -B build-wasm -S . -DOTIO_TYPESCRIPT_INSTALL=ON');
  console.error('  cmake --build build-wasm');
  process.exit(1);
}

// Copy files
for (const file of filesToCopy) {
  if (!fs.existsSync(file.from)) {
    console.error('Source file not found:', file.from);
    process.exit(1);
  }
  
  try {
    fs.copyFileSync(file.from, file.to);
    console.log(`✓ Copied ${path.basename(file.from)}`);
  } catch (error) {
    console.error(`✗ Failed to copy ${path.basename(file.from)}:`, error.message);
    process.exit(1);
  }
}

console.log('✅ All WASM files copied successfully');
console.log('Package is ready for publishing'); 