// SPDX-License-Identifier: Apache-2.0
// Copyright Contributors to the OpenTimelineIO project

/**
 * OpenTimelineIO TypeScript/JavaScript bindings
 * Main entry point for loading WASM modules and wrapper classes
 */

const path = require('path');
const fs = require('fs');

// Check if we're in Node.js or browser environment
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

/**
 * Initialize OpenTimelineIO modules
 * @returns {Promise<{OpenTime: Object, OTIO: Object}>} Initialized modules
 */
async function initializeOTIO() {
  if (isNode) {
    // Node.js environment
    const OpenTimeModule = require('./dist/opentime.js');
    const OpenTimelineIOModule = require('./dist/opentimelineio.js');
    
    // Load wrapper classes
    require('./wrappers.js');
    
    // Initialize both modules
    const openTimeInstance = await OpenTimeModule();
    const otioInstance = await OpenTimelineIOModule();
    
    // Set global Module for wrapper classes
    global.Module = otioInstance;
    
    return {
      OpenTime: openTimeInstance,
      OTIO: global.OTIO
    };
  } else {
    // Browser environment
    throw new Error('Browser environment not supported via require(). Please load modules directly via <script> tags.');
  }
}

/**
 * Load modules in browser environment
 * Call this function after loading the script tags
 */
async function initializeBrowser() {
  if (typeof window === 'undefined') {
    throw new Error('Browser environment not detected');
  }
  
  // Initialize both modules
  const openTimeInstance = await window.OpenTimeModule();
  const otioInstance = await window.OpenTimelineIOModule();
  
  // Set global Module for wrapper classes
  window.Module = otioInstance;
  
  return {
    OpenTime: openTimeInstance,
    OTIO: window.OTIO
  };
}

// Export for different environments
if (isNode) {
  module.exports = initializeOTIO;
  module.exports.initializeBrowser = initializeBrowser;
} else {
  // Browser environment - expose as global
  window.initializeOTIO = initializeBrowser;
} 