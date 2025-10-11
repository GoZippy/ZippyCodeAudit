#!/usr/bin/env node

/**
 * Dashboard Build Script
 * Creates optimized static build for lightweight deployment
 */

const fs = require('fs-extra');
const path = require('path');
const { minify } = require('html-minifier-terser');
const CleanCSS = require('clean-css');

const BUILD_DIR = 'dist/dashboard';
const SOURCE_DIR = 'src/dashboard';

async function buildDashboard() {
  console.log('🏗️  Building ZippyCodeAudit Dashboard...');

  try {
    // Clean build directory
    await fs.remove(BUILD_DIR);
    await fs.ensureDir(BUILD_DIR);

    // Copy static assets
    await copyStaticAssets();

    // Process HTML
    await processHTML();

    // Process CSS
    await processCSS();

    // Process JavaScript (basic minification)
    await processJavaScript();

    // Create PWA assets
    await createPWAAssets();

    console.log('✅ Dashboard build completed!');
    console.log(`📁 Build output: ${BUILD_DIR}/`);
    console.log('🚀 Ready for deployment');

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

async function copyStaticAssets() {
  console.log('📂 Copying static assets...');

  // Copy public directory
  if (await fs.pathExists(`${SOURCE_DIR}/public`)) {
    await fs.copy(`${SOURCE_DIR}/public`, `${BUILD_DIR}`);
  }

  // Copy favicon and other assets
  const assetsToCopy = ['favicon.svg', 'manifest.json'];
  for (const asset of assetsToCopy) {
    const srcPath = `${SOURCE_DIR}/${asset}`;
    if (await fs.pathExists(srcPath)) {
      await fs.copy(srcPath, `${BUILD_DIR}/${asset}`);
    }
  }
}

async function processHTML() {
  console.log('📄 Processing HTML...');

  const htmlPath = `${SOURCE_DIR}/index.html`;
  const outputPath = `${BUILD_DIR}/index.html`;

  if (!await fs.pathExists(htmlPath)) {
    console.warn('⚠️  HTML file not found, skipping processing');
    return;
  }

  let html = await fs.readFile(htmlPath, 'utf8');

  // Basic HTML minification for production
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    html = await minify(html, {
      removeComments: true,
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      removeEmptyAttributes: true,
      removeRedundantAttributes: true
    });
  }

  await fs.writeFile(outputPath, html);
}

async function processCSS() {
  console.log('🎨 Processing CSS...');

  const cssPath = `${SOURCE_DIR}/styles.css`;
  const outputPath = `${BUILD_DIR}/styles.css`;

  if (!await fs.pathExists(cssPath)) {
    console.warn('⚠️  CSS file not found, skipping processing');
    return;
  }

  const css = await fs.readFile(cssPath, 'utf8');

  // Minify CSS for production
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    const cleanCSS = new CleanCSS({
      level: 2,
      inline: false
    });

    const result = cleanCSS.minify(css);
    if (result.errors.length > 0) {
      console.warn('⚠️  CSS minification warnings:', result.errors);
    }

    await fs.writeFile(outputPath, result.styles);
  } else {
    await fs.writeFile(outputPath, css);
  }
}

async function processJavaScript() {
  console.log('⚡ Processing JavaScript...');

  const jsFiles = [
    'app.js',
    'utils/storage.js',
    'utils/api.js',
    'components/metrics-card.js',
    'components/activity-item.js',
    'components/task-item.js',
    'components/report-card.js'
  ];

  for (const jsFile of jsFiles) {
    const srcPath = `${SOURCE_DIR}/${jsFile}`;
    const outputPath = `${BUILD_DIR}/${jsFile}`;

    if (await fs.pathExists(srcPath)) {
      let js = await fs.readFile(srcPath, 'utf8');

      // Basic JS minification for production (simple regex-based)
      const isProduction = process.env.NODE_ENV === 'production';
      if (isProduction) {
        // Remove comments and extra whitespace
        js = js
          .replace(/\/\/.*$/gm, '') // Remove single-line comments
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
          .replace(/\s+/g, ' ') // Collapse whitespace
          .replace(/;\s*}/g, '}') // Remove unnecessary semicolons
          .trim();
      }

      await fs.writeFile(outputPath, js);
    }
  }
}

async function createPWAAssets() {
  console.log('📱 Creating PWA assets...');

  // Create basic icons if they don't exist
  const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

  for (const size of iconSizes) {
    const iconPath = `${BUILD_DIR}/icon-${size}x${size}.png`;
    if (!await fs.pathExists(iconPath)) {
      // Create a simple placeholder icon (in a real app, you'd generate proper icons)
      console.log(`   ℹ️  Icon ${size}x${size} not found, skipping`);
    }
  }

  // Create apple-touch-icon
  const appleIconPath = `${BUILD_DIR}/apple-touch-icon.png`;
  if (!await fs.pathExists(appleIconPath)) {
    console.log('   ℹ️  Apple touch icon not found, skipping');
  }
}

async function createBuildInfo() {
  const buildInfo = {
    version: require('../package.json').version,
    buildTime: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    gitCommit: await getGitCommit(),
    buildTool: 'zippy-build-script'
  };

  await fs.writeJson(`${BUILD_DIR}/build-info.json`, buildInfo, { spaces: 2 });
}

async function getGitCommit() {
  try {
    const { execSync } = require('child_process');
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'unknown';
  }
}

// Run build if called directly
if (require.main === module) {
  buildDashboard()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Build failed:', error);
      process.exit(1);
    });
}

module.exports = { buildDashboard };
