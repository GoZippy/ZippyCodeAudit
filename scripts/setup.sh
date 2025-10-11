#!/bin/bash

# ============================================================
# ZippyCodeAudit Setup Script - Linux/macOS
# ============================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project information
PROJECT_NAME="ZippyCodeAudit"
REPO_URL="https://github.com/GoZippy/ZippyCodeAudit.git"

echo -e "${BLUE}🧩 Setting up ${PROJECT_NAME}...${NC}"

# Check prerequisites
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required but not installed.${NC}"
    echo -e "${YELLOW}Please install Node.js from https://nodejs.org/${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${RED}❌ Node.js version 16 or higher is required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) is installed${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is required but not installed.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v) is installed${NC}"

# Check git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ git is required but not installed.${NC}"
    echo -e "${YELLOW}Please install git from https://git-scm.com/${NC}"
    exit 1
fi

echo -e "${GREEN}✅ git $(git --version) is installed${NC}"

# Clone or update repository
echo -e "${YELLOW}📥 Setting up repository...${NC}"

if [ -d ".git" ]; then
    echo -e "${BLUE}📂 Repository already exists, pulling latest changes...${NC}"
    git pull origin main
else
    echo -e "${BLUE}📂 Cloning repository...${NC}"
    git clone "$REPO_URL" .
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Build components
echo -e "${YELLOW}🔨 Building components...${NC}"
npm run build

# Setup CLI tool
echo -e "${YELLOW}🛠️  Setting up CLI tool...${NC}"
chmod +x scripts/install-cli.sh

# Create configuration
echo -e "${YELLOW}⚙️  Creating default configuration...${NC}"

if [ ! -f "zippycodesaudit.config.json" ]; then
    cat > zippycodesaudit.config.json << 'EOF'
{
  "project": {
    "name": "ZippyCodeAudit Demo",
    "type": "auto-detect"
  },
  "analysis": {
    "includePatterns": ["**/*.{js,ts,py,go,md,json,yml,yaml}"],
    "excludePatterns": ["node_modules/**", "dist/**", "build/**", ".git/**"],
    "maxDepth": 10
  },
  "reporting": {
    "format": "markdown",
    "outputDir": "docs/audit_reports"
  },
  "automation": {
    "enabled": false,
    "schedule": "0 14 * * 1"
  }
}
EOF
    echo -e "${GREEN}✅ Default configuration created${NC}"
else
    echo -e "${BLUE}📋 Configuration file already exists${NC}"
fi

# Setup audit system
echo -e "${YELLOW}📋 Setting up audit system...${NC}"

if [ ! -d "docs" ]; then
    mkdir -p docs
fi

# Copy audit system files if they don't exist
if [ ! -f "docs/PROJECT_AUDIT_PROMPT.md" ]; then
    cp src/dashboard/index.html docs/PROJECT_AUDIT_PROMPT.md 2>/dev/null || echo "Note: Audit prompt template not copied"
fi

# Create audit reports directory
mkdir -p docs/audit_reports

# Setup development environment
echo -e "${YELLOW}🚀 Setting up development environment...${NC}"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
# ZippyCodeAudit Environment Configuration

# API Configuration
ZIPPY_MCP_API_URL=http://localhost:3000/api

# Development Settings
NODE_ENV=development
PORT=3000

# Dashboard Settings
DASHBOARD_PORT=3001

# Logging
LOG_LEVEL=info

# Optional: Enable debug mode
# DEBUG=zippycodesaudit:*
EOF
    echo -e "${GREEN}✅ Environment configuration created${NC}"
else
    echo -e "${BLUE}📋 Environment file already exists${NC}"
fi

# Install CLI globally
echo -e "${YELLOW}🌐 Installing CLI tool globally...${NC}"
./scripts/install-cli.sh

# Test installation
echo -e "${YELLOW}🧪 Testing installation...${NC}"

if command -v zippy-audit &> /dev/null; then
    echo -e "${GREEN}✅ CLI tool installed successfully${NC}"

    # Show version
    VERSION=$(zippy-audit --version)
    echo -e "${GREEN}✅ Version: $VERSION${NC}"
else
    echo -e "${RED}❌ CLI tool installation failed${NC}"
    echo -e "${YELLOW}You can still run it locally with: npm start${NC}"
fi

# Setup completion message
echo -e "${GREEN}🎉 ${PROJECT_NAME} setup completed!${NC}"
echo ""
echo -e "${BLUE}🚀 Getting Started:${NC}"
echo -e "   1. ${YELLOW}cd $(pwd)${NC}"
echo -e "   2. ${YELLOW}zippy-audit init${NC} - Initialize audit system"
echo -e "   3. ${YELLOW}zippy-audit analyze${NC} - Run your first audit"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo -e "   • CLI Guide: ${YELLOW}docs/examples/cli-usage-examples.md${NC}"
echo -e "   • API Reference: ${YELLOW}docs/api/reference.md${NC}"
echo -e "   • Web Dashboard: ${YELLOW}http://localhost:3001${NC}"
echo ""
echo -e "${BLUE}🔧 Available Commands:${NC}"
echo -e "   ${YELLOW}zippy-audit analyze${NC}    - Run comprehensive analysis"
echo -e "   ${YELLOW}zippy-audit check${NC}      - Run quality checks"
echo -e "   ${YELLOW}zippy-audit report${NC}     - Generate reports"
echo -e "   ${YELLOW}zippy-audit init${NC}       - Initialize audit system"
echo -e "   ${YELLOW}zippy-audit config${NC}     - Manage configuration"
echo ""
echo -e "${BLUE}💡 Tips:${NC}"
echo -e "   • Use ${YELLOW}zippy-audit --help${NC} for more options"
echo -e "   • Check ${YELLOW}docs/${NC} for detailed guides"
echo -e "   • Join our community at ${YELLOW}https://discord.gg/zippy${NC}"
echo ""
echo -e "${GREEN}Happy auditing! 🧩✨${NC}"
