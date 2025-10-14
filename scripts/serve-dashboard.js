#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Get the port configuration
let port = 3001; // default port
try {
  const configPath = path.join(__dirname, '..', '.zippycodesaudit-ports.json');
  const config = require(configPath);
  port = config?.ports?.dashboard?.port || 3001;
} catch (error) {
  // Use default port if config file doesn't exist or can't be read
  console.log('Using default port 3001 (no config file found)');
}

// Start the serve command
console.log(`🚀 Starting dashboard server on port ${port}...`);

const serveProcess = spawn('npx', ['serve', 'dist/dashboard', '-p', port.toString()], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down dashboard server...');
  serveProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down dashboard server...');
  serveProcess.kill('SIGTERM');
  process.exit(0);
});

serveProcess.on('error', (error) => {
  console.error('❌ Failed to start dashboard server:', error.message);
  process.exit(1);
});

serveProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Dashboard server exited with code ${code}`);
    process.exit(code);
  }
});
