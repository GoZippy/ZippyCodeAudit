#!/bin/bash

# ============================================================
# ZippyCodeAudit CLI Installation Script
# ============================================================

set -e

echo "🧩 Installing ZippyCodeAudit CLI..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create global symlink for CLI
echo "🔗 Creating global CLI symlink..."

# Remove existing symlink if it exists
if command -v zippy-audit &> /dev/null; then
    echo "Removing existing zippy-audit command..."
    npm uninstall -g zippycodesaudit 2>/dev/null || true
fi

# Install globally
npm install -g .

# Verify installation
echo "✅ Verifying installation..."
if command -v zippy-audit &> /dev/null; then
    echo "✅ ZippyCodeAudit CLI installed successfully!"
    echo ""
    echo "🚀 Available commands:"
    echo "   zippy-audit analyze    - Run comprehensive project analysis"
    echo "   zippy-audit check      - Run specific quality checks"
    echo "   zippy-audit report     - Generate audit reports"
    echo "   zippy-audit init       - Initialize audit system in project"
    echo "   zippy-audit config     - Manage configuration"
    echo "   zippy-audit --help     - Show all available options"
    echo ""
    echo "🎯 Quick start:"
    echo "   cd /path/to/your/project"
    echo "   zippy-audit init"
    echo "   zippy-audit analyze"
else
    echo "❌ Installation verification failed."
    echo "Please check that Node.js and npm are properly installed."
    exit 1
fi
