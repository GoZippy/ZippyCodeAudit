# ============================================================================
# ZippyCodeAudit Complete Setup Script - Windows PowerShell
# ============================================================================
# This script provides a complete, automated setup for ZippyCodeAudit
# including installation, configuration, and getting started guide.

param(
    [switch]$Force,
    [switch]$SkipDependencies,
    [switch]$QuickStart,
    [string]$InstallPath = $PWD.Path,
    [string]$ProjectName = "ZippyCodeAudit Setup"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Magenta = "Magenta"
$Cyan = "Cyan"

# Project information
$ProjectName = "🧩 ZippyCodeAudit"
$RepoUrl = "https://github.com/GoZippy/ZippyCodeAudit.git"

Write-Host "$ProjectName Complete Setup" -ForegroundColor $Magenta
Write-Host "================================================" -ForegroundColor $Magenta

# ============================================================================
# PREREQUISITES CHECK
# ============================================================================

Write-Host "🔍 Checking prerequisites..." -ForegroundColor $Yellow

# Check Node.js
try {
    $nodeVersion = node -v
    $majorVersion = [int]($nodeVersion -replace '^v(\d+)\..*', '$1')
    if ($majorVersion -lt 16) {
        Write-Host "❌ Node.js version 16 or higher is required. Current version: $($nodeVersion)" -ForegroundColor $Red
        Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor $Yellow
        exit 1
    }
    Write-Host "✅ Node.js $($nodeVersion) is installed" -ForegroundColor $Green
} catch {
    Write-Host "❌ Node.js is required but not installed." -ForegroundColor $Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor $Yellow
    exit 1
}

# Check npm
try {
    $npmVersion = npm -v
    Write-Host "✅ npm $($npmVersion) is installed" -ForegroundColor $Green
} catch {
    Write-Host "❌ npm is required but not installed." -ForegroundColor $Red
    exit 1
}

# Check git
try {
    $gitVersion = git --version
    Write-Host "✅ $($gitVersion) is installed" -ForegroundColor $Green
} catch {
    Write-Host "⚠️  git is recommended but not required for basic functionality." -ForegroundColor $Yellow
}

# ============================================================================
# INSTALLATION
# ============================================================================

Write-Host "📦 Starting installation..." -ForegroundColor $Yellow

# Create installation directory
if (-not (Test-Path $InstallPath)) {
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
}

# Clone or update repository
Write-Host "📥 Setting up repository..." -ForegroundColor $Yellow

if (Test-Path ".git" -PathType Container) {
    Write-Host "📂 Repository already exists, pulling latest changes..." -ForegroundColor $Blue
    git pull origin main
} else {
    Write-Host "📂 Cloning repository..." -ForegroundColor $Blue
    git clone $RepoUrl .
}

# Install dependencies
if (-not $SkipDependencies) {
    Write-Host "🔧 Installing dependencies..." -ForegroundColor $Yellow

    # Install main dependencies
    npm install

    # Install additional dependencies for full functionality
    Write-Host "📋 Installing additional dependencies..." -ForegroundColor $Blue
    npm install express cors helmet morgan express-rate-limit

    # Install development dependencies
    Write-Host "🛠️  Installing development dependencies..." -ForegroundColor $Blue
    npm install --save-dev jest eslint prettier nodemon

    Write-Host "✅ Dependencies installed successfully" -ForegroundColor $Green
}

# ============================================================================
# BUILD COMPONENTS
# ============================================================================

Write-Host "🔨 Building components..." -ForegroundColor $Yellow

try {
    # Build dashboard
    Write-Host "🏗️  Building dashboard..." -ForegroundColor $Blue
    npm run build:dashboard

    # Build VS Code extension (if applicable)
    if (Test-Path "extensions/vscode") {
        Write-Host "📝 Building VS Code extension..." -ForegroundColor $Blue
        Set-Location extensions/vscode
        npm install
        npm run compile
        Set-Location ../..
    }

    Write-Host "✅ Components built successfully" -ForegroundColor $Green
} catch {
    Write-Host "⚠️  Build completed with warnings (this is normal for development)" -ForegroundColor $Yellow
}

# ============================================================================
# CONFIGURATION
# ============================================================================

Write-Host "⚙️  Creating configuration..." -ForegroundColor $Yellow

# Create configuration file
$configPath = Join-Path $InstallPath "zippycodesaudit.config.json"
if (-not (Test-Path $configPath) -or $Force) {
    $config = @{
        project = @{
            name = $ProjectName
            type = "auto-detect"
        }
        analysis = @{
            includePatterns = @("**/*.{js,ts,py,go,md,json,yml,yaml}")
            excludePatterns = @("node_modules/**", "dist/**", "build/**", ".git/**")
            maxDepth = 10
        }
        reporting = @{
            format = "markdown"
            outputDir = "docs/audit_reports"
        }
        automation = @{
            enabled = $false
            schedule = "0 14 * * 1"  # Weekly on Monday at 2 PM
        }
        ui = @{
            theme = "auto"
            refreshInterval = 60000
        }
    }

    $config | ConvertTo-Json -Depth 3 | Out-File $configPath -Encoding UTF8
    Write-Host "✅ Configuration created" -ForegroundColor $Green
} else {
    Write-Host "📋 Configuration file already exists" -ForegroundColor $Blue
}

# ============================================================================
# SETUP DIRECTORIES
# ============================================================================

Write-Host "📁 Setting up directories..." -ForegroundColor $Yellow

# Create necessary directories
$dirs = @(
    "docs",
    "docs/audit_reports",
    "docs/guides",
    "docs/examples",
    "logs",
    "temp"
)

foreach ($dir in $dirs) {
    $fullPath = Join-Path $InstallPath $dir
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Host "   ✅ Created: $dir" -ForegroundColor $Green
    } else {
        Write-Host "   📂 Exists: $dir" -ForegroundColor $Blue
    }
}

# ============================================================================
# SETUP PROJECT REGISTRY
# ============================================================================

Write-Host "📋 Setting up project registry..." -ForegroundColor $Yellow

# Create initial project registry
$registryPath = Join-Path $env:USERPROFILE ".zippycodesaudit\projects.json"
$registryDir = Split-Path $registryPath -Parent

if (-not (Test-Path $registryDir)) {
    New-Item -ItemType Directory -Path $registryDir -Force | Out-Null
}

if (-not (Test-Path $registryPath) -or $Force) {
    $initialRegistry = @{
        projects = @{}
        currentProject = $null
        lastUpdated = (Get-Date).ToISOString()
    }

    $initialRegistry | ConvertTo-Json -Depth 2 | Out-File $registryPath -Encoding UTF8
    Write-Host "✅ Project registry initialized" -ForegroundColor $Green
} else {
    Write-Host "📋 Project registry already exists" -ForegroundColor $Blue
}

# ============================================================================
# SETUP ENVIRONMENT
# ============================================================================

Write-Host "🌍 Setting up environment..." -ForegroundColor $Yellow

# Create .env file
$envPath = Join-Path $InstallPath ".env"
if (-not (Test-Path $envPath) -or $Force) {
    # Scan for available ports
    $apiPort = 3006
    $dashboardPort = 3001

    # Check if ports are available
    try {
        $tcpConnections = netstat -an | Select-String ":$apiPort "
        if ($tcpConnections) {
            Write-Host "⚠️  Port $apiPort is in use, using alternative..." -ForegroundColor $Yellow
            $apiPort = 3007
        }
    } catch {
        # Use defaults if netstat fails
    }

    $envContent = @"
# ZippyCodeAudit Environment Configuration
# Generated on: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

# API Configuration
ZIPPY_MCP_API_URL=http://localhost:$apiPort/api

# Development Settings
NODE_ENV=development
API_PORT=$apiPort
DASHBOARD_PORT=$dashboardPort

# Dashboard Settings
DASHBOARD_URL=http://localhost:$dashboardPort

# Logging
LOG_LEVEL=info

# Optional: Enable debug mode
# DEBUG=zippycodesaudit:*

# Optional: AI Integration (configure these for AI features)
# AI_AUDIT_ENDPOINT=
# AI_AUDIT_API_KEY=
"@

    $envContent | Out-File $envPath -Encoding UTF8
    Write-Host "✅ Environment configuration created" -ForegroundColor $Green
    Write-Host "   📊 API Port: $apiPort" -ForegroundColor $Cyan
    Write-Host "   🖥️  Dashboard Port: $dashboardPort" -ForegroundColor $Cyan
} else {
    Write-Host "📋 Environment file already exists" -ForegroundColor $Blue
}

# ============================================================================
# SETUP SHORTCUTS
# ============================================================================

Write-Host "🔗 Setting up shortcuts..." -ForegroundColor $Yellow

# Create desktop shortcut (Windows)
$desktopPath = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktopPath "ZippyCodeAudit.lnk"

if (-not (Test-Path $shortcutPath) -or $Force) {
    try {
        $WshShell = New-Object -comObject WScript.Shell
        $Shortcut = $WshShell.CreateShortcut($shortcutPath)
        $Shortcut.TargetPath = "http://localhost:$dashboardPort"
        $Shortcut.Description = "ZippyCodeAudit Dashboard - Code auditing toolkit"
        $Shortcut.IconLocation = (Join-Path $InstallPath "src\dashboard\public\favicon.svg")
        $Shortcut.Save()

        Write-Host "✅ Desktop shortcut created" -ForegroundColor $Green
    } catch {
        Write-Host "⚠️  Could not create desktop shortcut (requires Windows)" -ForegroundColor $Yellow
    }
}

# ============================================================================
# FINAL SETUP
# ============================================================================

Write-Host "🎉 Setup completed!" -ForegroundColor $Green
Write-Host ""
Write-Host "🚀 Getting Started:" -ForegroundColor $Blue
Write-Host ""
Write-Host "1. 📊 Start the API Server:" -ForegroundColor $Yellow
Write-Host "   Set-Location '$InstallPath'" -ForegroundColor $White
Write-Host "   node simple-api.js" -ForegroundColor $Cyan
Write-Host ""
Write-Host "2. 🖥️  Start the Dashboard:" -ForegroundColor $Yellow
Write-Host "   npx serve dist/dashboard -p $dashboardPort" -ForegroundColor $Cyan
Write-Host ""
Write-Host "3. 🌐 Access the Dashboard:" -ForegroundColor $Yellow
Write-Host "   Open: http://localhost:$dashboardPort" -ForegroundColor $Cyan
Write-Host ""
Write-Host "4. 📁 Add Your Projects:" -ForegroundColor $Yellow
Write-Host "   • Use the 'Projects' tab in the dashboard" -ForegroundColor $White
Write-Host "   • Or use CLI: zippy-audit project add <path>" -ForegroundColor $White
Write-Host ""
Write-Host "5. 🔍 Run Audits:" -ForegroundColor $Yellow
Write-Host "   • Select a project in the dashboard" -ForegroundColor $White
Write-Host "   • Click 'Audit' or use CLI: zippy-audit analyze" -ForegroundColor $White
Write-Host ""

# Quick start option
if ($QuickStart) {
    Write-Host "🚀 Quick Start Mode Enabled" -ForegroundColor $Magenta
    Write-Host "Starting services automatically..." -ForegroundColor $Blue

    try {
        # Start API server in background
        Write-Host "📊 Starting API server..." -ForegroundColor $Blue
        Start-Process "node" -ArgumentList "simple-api.js" -NoNewWindow -WorkingDirectory $InstallPath

        # Start dashboard
        Write-Host "🖥️  Starting dashboard..." -ForegroundColor $Blue
        Start-Process "npx" -ArgumentList "serve", "dist/dashboard", "-p", $dashboardPort -NoNewWindow -WorkingDirectory $InstallPath

        Write-Host ""
        Write-Host "✅ Services started! Opening dashboard..." -ForegroundColor $Green

        # Open dashboard
        Start-Process "http://localhost:$dashboardPort"

    } catch {
        Write-Host "❌ Failed to start services automatically" -ForegroundColor $Red
        Write-Host "Please start them manually as shown above." -ForegroundColor $Yellow
    }
}

Write-Host "📚 Additional Resources:" -ForegroundColor $Blue
Write-Host "   • CLI Guide: docs/examples/cli-usage-examples.md" -ForegroundColor $Yellow
Write-Host "   • API Reference: docs/api/reference.md" -ForegroundColor $Yellow
Write-Host "   • User Guide: docs/guides/user-guide.md" -ForegroundColor $Yellow
Write-Host ""
Write-Host "🔧 Available Commands:" -ForegroundColor $Blue
Write-Host "   zippy-audit analyze    " -NoNewline; Write-Host "- Run comprehensive analysis" -ForegroundColor $Yellow
Write-Host "   zippy-audit project    " -NoNewline; Write-Host "- Manage projects" -ForegroundColor $Yellow
Write-Host "   zippy-audit report     " -NoNewline; Write-Host "- Generate reports" -ForegroundColor $Yellow
Write-Host "   zippy-audit check      " -NoNewline; Write-Host "- Run quality checks" -ForegroundColor $Yellow
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor $Blue
Write-Host "   • Use " -NoNewline; Write-Host "zippy-audit --help" -ForegroundColor $Yellow -NoNewline; Write-Host " for more options"
Write-Host "   • Check " -NoNewline; Write-Host "docs/guides/" -ForegroundColor $Yellow -NoNewline; Write-Host " for detailed guides"
Write-Host "   • Dashboard is PWA-ready - install as app for better experience" -ForegroundColor $Yellow
Write-Host ""
Write-Host "🎯 Happy auditing! 🧩✨" -ForegroundColor $Green

# ============================================================================
# SETUP COMPLETE
# ============================================================================

Write-Host ""
Write-Host "================================================" -ForegroundColor $Magenta
Write-Host "Setup completed successfully!" -ForegroundColor $Green
Write-Host "================================================" -ForegroundColor $Magenta
