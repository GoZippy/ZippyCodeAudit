# 📦 Setup Guide

Complete installation and setup instructions for ZippyCodeAudit across all platforms and use cases.

## 🚀 Quick Start

### Automated Installation (Recommended)

```bash
# Linux/macOS
git clone https://github.com/GoZippy/ZippyCodeAudit.git
cd ZippyCodeAudit
./scripts/setup.sh

# Windows PowerShell
git clone https://github.com/GoZippy/ZippyCodeAudit.git
cd ZippyCodeAudit
.\scripts\setup.ps1
```

This automated setup will:
- ✅ Check system requirements
- ✅ Scan for available ports
- ✅ Install dependencies
- ✅ Configure environment
- ✅ Set up CLI tool globally
- ✅ Show your personal access URLs

## 📋 System Requirements

### Minimum Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **Node.js** | 16.0.0 | 18.0.0+ LTS |
| **npm** | 7.0.0 | 9.0.0+ |
| **Git** | 2.20.0 | Latest |
| **RAM** | 512MB | 2GB+ |
| **Disk** | 100MB | 500MB+ |

### Platform-Specific Notes

**Windows**
- Windows 10+ (64-bit recommended)
- PowerShell 5.1+ or Windows Terminal
- Visual Studio Code (for extension)

**macOS**
- macOS 10.15+ (Catalina or newer)
- Xcode Command Line Tools
- Homebrew (recommended for dependencies)

**Linux**
- Ubuntu 18.04+, CentOS 7+, or similar
- curl/wget for downloading
- Package manager (apt, yum, etc.)

## 🔧 Installation Methods

### Method 1: Automated Setup (Recommended)

#### Linux/macOS Setup

```bash
# 1. Clone repository
git clone https://github.com/GoZippy/ZippyCodeAudit.git
cd ZippyCodeAudit

# 2. Run automated setup
./scripts/setup.sh

# 3. Follow on-screen instructions
# The script will show your personal URLs like:
# 📊 Web Dashboard: http://localhost:3456
# 🔗 API Services: http://localhost:3457/api
```

#### Windows PowerShell Setup

```powershell
# 1. Clone repository
git clone https://github.com/GoZippy/ZippyCodeAudit.git
cd ZippyCodeAudit

# 2. Run automated setup
.\scripts\setup.ps1

# 3. Follow on-screen instructions
# The script will show your personal URLs
```

#### Setup Script Features

**Smart Port Allocation**
- Automatically finds available ports
- Avoids conflicts with existing services
- Shows which processes are using conflicting ports
- Provides alternative port suggestions

**Environment Configuration**
- Creates `.env` file with your port assignments
- Sets up development environment
- Configures API endpoints

**Verification**
- Tests CLI installation
- Verifies dashboard accessibility
- Shows next steps and available commands

### Method 2: Manual Installation

#### Step 1: Clone Repository

```bash
git clone https://github.com/GoZippy/ZippyCodeAudit.git
cd ZippyCodeAudit
```

#### Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Verify installation
npm --version
node --version
```

#### Step 3: Build Components

```bash
# Build all components
npm run build

# Build specific components if needed
npm run build:cli
npm run build:dashboard
npm run build:vscode
```

#### Step 4: Configure Ports (Optional)

```bash
# Check available ports
node scripts/port-scanner.js

# Or use PowerShell version on Windows
.\scripts\check-ports.ps1

# Configure custom ports if needed
zippy-audit config --set dashboard.port=3002
zippy-audit config --set api.port=3003
```

#### Step 5: Install CLI Globally

```bash
# Linux/macOS
npm install -g .

# Windows (may need admin privileges)
npm install -g .

# Or use sudo if permission denied
sudo npm install -g .
```

#### Step 6: Verify Installation

```bash
# Check CLI version
zippy-audit --version

# Test basic functionality
zippy-audit --help

# Initialize in a test project
mkdir test-project
cd test-project
zippy-audit init
```

### Method 3: Development Setup

#### For Contributors and Advanced Users

```bash
# 1. Clone repository
git clone https://github.com/GoZippy/ZippyCodeAudit.git
cd ZippyCodeAudit

# 2. Install dependencies
npm install

# 3. Set up development environment
cp .env.example .env  # If .env.example exists
# Edit .env with your configuration

# 4. Build for development
npm run build

# 5. Start development servers
npm run dev:dashboard  # Web dashboard
npm run dev:vscode     # VS Code extension development

# 6. Run tests
npm test

# 7. Lint code
npm run lint
```

## 🌐 Service Access

### Your Personal URLs

After setup, you'll see URLs like:
```
🌐 Your Service URLs:
📊 Web Dashboard: http://localhost:3456
🔗 API Services: http://localhost:3457/api
```

**Port Assignment**
- Ports are automatically assigned during setup
- Configuration saved to `.zippycodesaudit-ports.json`
- Can be changed later via configuration

**Access Methods**
- **Web Dashboard**: Browser access for visual management
- **API Services**: Programmatic access for integrations
- **CLI Tool**: Command-line interface for automation

### Troubleshooting Access Issues

**Dashboard Not Loading**
```bash
# Check if dashboard process is running
ps aux | grep serve  # Linux/macOS
Get-Process -Name node  # Windows

# Restart dashboard
npm run serve:dashboard

# Check port configuration
cat .zippycodesaudit-ports.json
```

**API Connection Issues**
```bash
# Test API connectivity
curl http://localhost:YOUR_API_PORT/api/health

# Check API server status
zippy-audit config --show
```

## ⚙️ Configuration

### Configuration Files

**Global Configuration** (`zippycodesaudit.config.json`)
```json
{
  "project": {
    "name": "My Project",
    "type": "web"
  },
  "analysis": {
    "includePatterns": ["src/**/*.{js,ts,py}"],
    "excludePatterns": ["node_modules/**"],
    "maxDepth": 10
  },
  "reporting": {
    "format": "markdown",
    "outputDir": "docs/audit_reports"
  }
}
```

**Environment Configuration** (`.env`)
```bash
# API Configuration
ZIPPY_MCP_API_URL=http://localhost:3000/api
API_KEY=your-api-key-here

# Dashboard Settings
DASHBOARD_PORT=3001

# Development Settings
NODE_ENV=development
```

### VS Code Settings

**Workspace Settings** (`.vscode/settings.json`)
```json
{
  "zippycodesaudit.enable": true,
  "zippycodesaudit.autoCheck": true,
  "zippycodesaudit.reportFormat": "markdown"
}
```

## 🔧 Advanced Configuration

### Custom Port Assignment

**Change Dashboard Port**
```bash
zippy-audit config --set dashboard.port=3002
```

**Change API Port**
```bash
zippy-audit config --set api.port=3003
```

**Rescan Available Ports**
```bash
# Rescan and update configuration
node scripts/port-scanner.js
```

### API Tier Configuration

**Public Tier (Free)**
```bash
zippy-audit config --set api.tier=public
# No API key required
```

**Premium Tier (Paid)**
```bash
zippy-audit config --set api.tier=premium
zippy-audit config --set api.key=your-premium-api-key
```

**Private Tier (Enterprise)**
```bash
zippy-audit config --set api.tier=private
zippy-audit config --set api.endpoint=https://your-company.com/api
zippy-audit config --set api.key=your-enterprise-api-key
```

### Integration Setup

**GitHub Integration**
```bash
# Set up GitHub webhook
zippy-audit config --set integrations.github.webhookUrl=https://your-github-webhook-url
zippy-audit config --set integrations.github.secret=your-webhook-secret
```

**Slack Notifications**
```bash
# Set up Slack notifications
zippy-audit config --set integrations.slack.webhookUrl=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

## 🛠️ Platform-Specific Setup

### Windows Setup

#### PowerShell Setup

```powershell
# Run as Administrator for global installation
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Navigate to project
cd "C:\Path\To\ZippyCodeAudit"

# Run setup script
.\scripts\setup.ps1

# If permission issues with global install, use:
# npm install -g --force .
```

#### Windows Subsystem for Linux (WSL)

```bash
# In WSL terminal
./scripts/setup.sh

# Access from Windows browser
# Dashboard will be available at http://localhost:PORT from Windows
```

#### Windows Terminal Setup

```powershell
# Install Windows Terminal for better experience
winget install --id Microsoft.WindowsTerminal

# Configure terminal settings for better CLI experience
```

### macOS Setup

#### Homebrew Installation

```bash
# Install Node.js via Homebrew (recommended)
brew install node

# Install Git if not already installed
brew install git

# Run setup
./scripts/setup.sh
```

#### Manual Installation

```bash
# Download Node.js from nodejs.org
# Install to /usr/local/bin or /opt/local/bin

# Verify installation
node --version
npm --version

# Run setup
./scripts/setup.sh
```

### Linux Setup

#### Ubuntu/Debian

```bash
# Update package manager
sudo apt update

# Install Node.js (using NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git if not already installed
sudo apt-get install git

# Run setup
./scripts/setup.sh
```

#### CentOS/RHEL/Fedora

```bash
# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Git
sudo yum install git

# Run setup
./scripts/setup.sh
```

#### Docker Setup

```dockerfile
FROM node:18-alpine

# Copy project files
WORKDIR /app
COPY . .

# Install dependencies
RUN npm ci

# Build application
RUN npm run build

# Expose ports
EXPOSE 3000 3001

# Start services
CMD ["npm", "start"]
```

## 🔍 Verification

### Check Installation

```bash
# Verify CLI installation
zippy-audit --version
zippy-audit --help

# Check port configuration
cat .zippycodesaudit-ports.json

# Verify dashboard accessibility
curl http://localhost:$(cat .zippycodesaudit-ports.json | jq -r '.ports.dashboard.port')/health
```

### Test Functionality

```bash
# Initialize audit system
mkdir test-project
cd test-project
zippy-audit init

# Run test analysis
zippy-audit analyze

# Check for issues
zippy-audit check --all

# Generate test report
zippy-audit report --format markdown
```

## 🆘 Troubleshooting

### Installation Issues

**Permission Denied**
```bash
# Use sudo for global installation
sudo npm install -g .

# Or install locally in project
npm install zippycodesaudit --save-dev
```

**Port Already in Use**
```bash
# Check what's using the port
lsof -i :3000  # Linux/macOS
netstat -ano | findstr :3000  # Windows

# Kill conflicting process
kill -9 PID_NUMBER  # Linux/macOS
taskkill /PID PID_NUMBER /F  # Windows

# Or use different ports
zippy-audit config --set dashboard.port=3002
```

**Node.js Version Issues**
```bash
# Check Node.js version
node --version

# Update Node.js if too old
# Linux/macOS: Use nvm or update package
# Windows: Download latest from nodejs.org

# Verify npm version
npm --version
```

### Runtime Issues

**Dashboard Won't Load**
```bash
# Check if process is running
ps aux | grep serve

# Check port availability
node scripts/port-scanner.js

# Restart dashboard
npm run serve:dashboard
```

**CLI Commands Not Found**
```bash
# Reinstall globally
npm uninstall -g zippycodesaudit
npm install -g .

# Check PATH
which zippy-audit
echo $PATH
```

**Analysis Timeout**
```bash
# Increase timeout
zippy-audit config --set analysis.timeout=60000

# Reduce scope for large projects
zippy-audit analyze --max-depth=5
```

## 📚 Next Steps

### After Successful Installation

1. **Initialize Your Project**
   ```bash
   cd your-project
   zippy-audit init
   ```

2. **Run Your First Audit**
   ```bash
   zippy-audit analyze
   ```

3. **Access the Dashboard**
   ```
   http://localhost:YOUR_DASHBOARD_PORT
   ```

4. **Explore Features**
   - Use VS Code extension for integrated development
   - Set up CI/CD integration
   - Configure team collaboration features

### Learning Resources

- **[User Guide](user-guide.md)**: Complete usage instructions
- **[CLI Examples](examples/cli-usage-examples.md)**: Real-world usage examples
- **[API Reference](api/reference.md)**: Complete API documentation
- **[Troubleshooting](troubleshooting.md)**: Common issues and solutions

## 🔄 Updates & Maintenance

### Updating ZippyCodeAudit

```bash
# Pull latest changes
git pull origin main

# Reinstall dependencies
npm install

# Rebuild components
npm run build

# Update global CLI
npm install -g .
```

### Backup & Restore

```bash
# Backup configuration
cp zippycodesaudit.config.json zippycodesaudit.config.json.backup
cp .env .env.backup

# Restore from backup
cp zippycodesaudit.config.json.backup zippycodesaudit.config.json
cp .env.backup .env
```

---

*"Set up once, audit everywhere."*

**Version:** 1.0.0
**Last Updated:** 2025-01-11
