#!/usr/bin/env node

/**
 * Test script to verify OpenTimelineIO web test setup
 * Run this before running Playwright tests to ensure everything is configured correctly
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

console.log('🎬 OpenTimelineIO Web Test Setup Verification');
console.log('==============================================\n');

async function checkUrl(url, description) {
  return new Promise((resolve) => {
    console.log(`📡 Checking ${description}...`);
    
    const request = http.get(url, (response) => {
      const { statusCode, headers } = response;
      
      if (statusCode === 200) {
        console.log(`✅ ${description}: OK (${statusCode})`);
        console.log(`   Content-Type: ${headers['content-type']}`);
        console.log(`   Content-Length: ${headers['content-length']}`);
        resolve(true);
      } else {
        console.log(`❌ ${description}: Failed (${statusCode})`);
        resolve(false);
      }
      
      response.on('data', () => {}); // Consume response
    });
    
    request.on('error', (error) => {
      console.log(`❌ ${description}: Error - ${error.message}`);
      resolve(false);
    });
    
    request.setTimeout(5000, () => {
      console.log(`❌ ${description}: Timeout`);
      request.destroy();
      resolve(false);
    });
  });
}

async function startWebServer() {
  return new Promise((resolve) => {
    console.log('🌐 Starting web server...');
    
    // Try python3 first, then python as fallback
    const pythonCmd = 'python3';
    
    // Start server from project root (parent directory)
    const serverProcess = spawn(pythonCmd, ['-m', 'http.server', '8080'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });
    
    let serverStarted = false;
    let serverOutput = '';
    
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      serverOutput += output;
      console.log(`Server: ${output.trim()}`);
      
      if ((output.includes('Serving HTTP') || output.includes('server at port')) && !serverStarted) {
        serverStarted = true;
        console.log('✅ Web server started successfully');
        // Give it a moment to fully initialize
        setTimeout(() => resolve(serverProcess), 1000);
      }
    });
    
    serverProcess.stderr.on('data', (data) => {
      const error = data.toString();
      console.error(`Web server stderr: ${error.trim()}`);
      
      if (error.includes('Address already in use')) {
        console.log('ℹ️  Port 8080 already in use, assuming existing server');
        serverStarted = true;
        resolve('existing');
      }
    });
    
    serverProcess.on('error', (error) => {
      console.error(`❌ Failed to start web server: ${error.message}`);
      console.log('ℹ️  Trying to check if server is already running...');
      resolve('check_existing');
    });
    
    // More generous timeout
    setTimeout(() => {
      if (!serverStarted) {
        console.log('❌ Web server startup timeout');
        console.log(`Server output was: ${serverOutput}`);
        
        // Try to check if something is already running on port 8080
        console.log('ℹ️  Checking if port 8080 is already in use...');
        serverProcess.kill();
        resolve('check_existing');
      }
    }, 15000);
  });
}

async function checkFileExists(filePath) {
  const fs = require('fs');
  return new Promise((resolve) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      resolve(!err);
    });
  });
}

async function main() {
  // Check if required files exist
  console.log('📁 Checking required files...');
  
  const requiredFiles = [
    '../build-wasm/src/ts-opentimelineio/opentime-bindings/opentime.js',
    '../build-wasm/src/ts-opentimelineio/opentimelineio-bindings/opentimelineio.js',
    '../src/ts-opentimelineio/typescript/wrappers.js'
  ];
  
  let allFilesExist = true;
  for (const file of requiredFiles) {
    const fullPath = path.join(__dirname, file);
    const exists = await checkFileExists(fullPath);
    if (exists) {
      console.log(`✅ ${file}: Found`);
    } else {
      console.log(`❌ ${file}: Not found`);
      allFilesExist = false;
    }
  }
  
  if (!allFilesExist) {
    console.log('\n❌ Missing required files. Please build the WASM modules first:');
    console.log('   cd build-wasm && make -j$(nproc)');
    process.exit(1);
  }
  
  console.log('\n🌐 Testing web server...');
  
  // Start web server
  const serverProcess = await startWebServer();
  if (!serverProcess) {
    console.log('\n❌ Failed to start web server');
    process.exit(1);
  }
  
  // Wait a moment for server to be ready
  if (serverProcess === 'existing' || serverProcess === 'check_existing') {
    console.log('ℹ️  Using existing server or checking connectivity...');
    await new Promise(resolve => setTimeout(resolve, 1000));
  } else {
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Test URLs
  const testUrls = [
    {
      url: 'http://localhost:8080/build-wasm/src/ts-opentimelineio/opentime-bindings/opentime.js',
      description: 'OpenTime WASM module'
    },
    {
      url: 'http://localhost:8080/build-wasm/src/ts-opentimelineio/opentimelineio-bindings/opentimelineio.js',
      description: 'OpenTimelineIO WASM module'
    },
    {
      url: 'http://localhost:8080/src/ts-opentimelineio/typescript/wrappers.js',
      description: 'TypeScript wrappers'
    }
  ];
  
  let allUrlsWork = true;
  for (const { url, description } of testUrls) {
    const success = await checkUrl(url, description);
    if (!success) {
      allUrlsWork = false;
    }
  }
  
  // Cleanup
  console.log('\n🧹 Cleaning up...');
  if (serverProcess && typeof serverProcess.kill === 'function') {
    serverProcess.kill();
  } else {
    console.log('ℹ️  No server process to clean up (using existing server)');
  }
  
  if (allUrlsWork) {
    console.log('\n🎉 Setup verification complete! All checks passed.');
    console.log('\nYou can now run the Playwright tests:');
    console.log('   npm test');
    process.exit(0);
  } else {
    console.log('\n❌ Setup verification failed. Please check the errors above.');
    process.exit(1);
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n\n🛑 Setup verification interrupted');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Setup verification terminated');
  process.exit(1);
});

main().catch((error) => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
}); 