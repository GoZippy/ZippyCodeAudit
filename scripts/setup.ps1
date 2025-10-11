# ============================================================
# ZippyCodeAudit Setup Script - Windows PowerShell
# ============================================================

param(
    [switch]$Force,
    [switch]$SkipDependencies,
    [string]$InstallPath = $PWD.Path
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$NC = "White"

# Project information
$ProjectName = "ZippyCodeAudit"
$RepoUrl = "https://github.com/GoZippy/ZippyCodeAudit.git"

Write-Host "🧩 Setting up $($ProjectName)..." -ForegroundColor $Blue

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor $Yellow

# Check Node.js
try {
    $nodeVersion = node -v
    $majorVersion = [int]($nodeVersion -replace '^v(\d+)\..*', '$1')
    if ($majorVersion -lt 16) {
        Write-Host "❌ Node.js version 16 or higher is required. Current version: $($nodeVersion)" -ForegroundColor $Red
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
    Write-Host "❌ git is required but not installed." -ForegroundColor $Red
    Write-Host "Please install git from https://git-scm.com/" -ForegroundColor $Yellow
    exit 1
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

# Install dependencies (unless skipped)
if (-not $SkipDependencies) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor $Yellow
    npm install
}

# Build components
Write-Host "🔨 Building components..." -ForegroundColor $Yellow
npm run build

# Setup CLI tool
Write-Host "🛠️  Setting up CLI tool..." -ForegroundColor $Yellow

# Create configuration
Write-Host "⚙️  Creating default configuration..." -ForegroundColor $Yellow

$configPath = Join-Path $InstallPath "zippycodesaudit.config.json"
if (-not (Test-Path $configPath) -or $Force) {
    $config = @{
        project = @{
            name = "ZippyCodeAudit Demo"
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
            schedule = "0 14 * * 1"
        }
    }

    $config | ConvertTo-Json -Depth 3 | Out-File $configPath -Encoding UTF8
    Write-Host "✅ Default configuration created" -ForegroundColor $Green
} else {
    Write-Host "📋 Configuration file already exists" -ForegroundColor $Blue
}

# Setup audit system
Write-Host "📋 Setting up audit system..." -ForegroundColor $Yellow

$docsPath = Join-Path $InstallPath "docs"
if (-not (Test-Path $docsPath)) {
    New-Item -ItemType Directory -Path $docsPath -Force | Out-Null
}

# Create audit reports directory
$reportsPath = Join-Path $docsPath "audit_reports"
if (-not (Test-Path $reportsPath)) {
    New-Item -ItemType Directory -Path $reportsPath -Force | Out-Null
}

# Scan for available ports
Write-Host "🔍 Scanning for available ports..." -ForegroundColor $Yellow

# Run port scanner
$configPath = Join-Path $InstallPath ".zippycodesaudit-ports.json"

if (-not (Test-Path $configPath) -or $Force) {
    Write-Host "🔧 Running port scanner to find available ports..." -ForegroundColor $Blue

    try {
        # Try Node.js version first
        if (Get-Command node -ErrorAction SilentlyContinue) {
            $portScanResult = node scripts/port-scanner.js 2>$null
            if ($LASTEXITCODE -eq 0 -and (Test-Path $configPath)) {
                Write-Host "✅ Port configuration generated using Node.js" -ForegroundColor $Green
            } else {
                throw "Node.js port scan failed"
            }
        } else {
            # Fallback to PowerShell port scanner
            .\scripts\check-ports.ps1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Port configuration generated using PowerShell" -ForegroundColor $Green
            } else {
                throw "PowerShell port scan failed"
            }
        }
    } catch {
        Write-Host "⚠️  Port scanner failed, using defaults" -ForegroundColor $Yellow
        $apiPort = 3000
        $dashboardPort = 3001
    }
} else {
    Write-Host "📋 Using existing port configuration" -ForegroundColor $Blue
}

# Load port configuration if available
if (Test-Path $configPath) {
    try {
        $portConfig = Get-Content $configPath -Raw | ConvertFrom-Json
        $apiPort = $portConfig.ports.api.port
        $dashboardPort = $portConfig.ports.dashboard.port
    } catch {
        $apiPort = 3000
        $dashboardPort = 3001
    }
} else {
    $apiPort = 3000
    $dashboardPort = 3001
}

Write-Host "✅ Using API port: $($apiPort)" -ForegroundColor $Green
Write-Host "✅ Using Dashboard port: $($dashboardPort)" -ForegroundColor $Green

# Setup development environment
Write-Host "🚀 Setting up development environment..." -ForegroundColor $Yellow

# Create .env file if it doesn't exist
$envPath = Join-Path $InstallPath ".env"
if (-not (Test-Path $envPath) -or $Force) {
    $envContent = @"
# ZippyCodeAudit Environment Configuration

# API Configuration
ZIPPY_MCP_API_URL=http://localhost:$($apiPort)/api

# Development Settings
NODE_ENV=development
PORT=$($apiPort)

# Dashboard Settings
DASHBOARD_PORT=$($dashboardPort)

# Logging
LOG_LEVEL=info

# Optional: Enable debug mode
# DEBUG=zippycodesaudit:*
"@

    $envContent | Out-File $envPath -Encoding UTF8
    Write-Host "✅ Environment configuration created with dynamic ports" -ForegroundColor $Green
} else {
    Write-Host "📋 Environment file already exists" -ForegroundColor $Blue
    # Update existing .env with new ports if port config exists
    if (Test-Path $configPath) {
        try {
            $content = Get-Content $envPath -Raw
            $content = $content -replace "PORT=\d+", "PORT=$($apiPort)"
            $content = $content -replace "DASHBOARD_PORT=\d+", "DASHBOARD_PORT=$($dashboardPort)"
            $content | Out-File $envPath -Encoding UTF8
            Write-Host "✅ Updated existing .env with new port assignments" -ForegroundColor $Green
        } catch {
            Write-Host "⚠️  Could not update .env file" -ForegroundColor $Yellow
        }
    }
}

# Install CLI globally
Write-Host "🌐 Installing CLI tool globally..." -ForegroundColor $Yellow

try {
    # Remove existing installation if forcing
    if ($Force) {
        npm uninstall -g zippycodesaudit 2>$null | Out-Null
    }

    # Install globally
    npm install -g .
    Write-Host "✅ CLI tool installed globally" -ForegroundColor $Green
} catch {
    Write-Host "❌ Failed to install CLI tool globally" -ForegroundColor $Red
    Write-Host "You can still run it locally with: npm start" -ForegroundColor $Yellow
}

# Test installation
Write-Host "🧪 Testing installation..." -ForegroundColor $Yellow

try {
    $version = zippy-audit --version 2>$null
    if ($version) {
        Write-Host "✅ CLI tool installed successfully" -ForegroundColor $Green
        Write-Host "✅ Version: $($version)" -ForegroundColor $Green
    } else {
        throw "No version returned"
    }
} catch {
    Write-Host "❌ CLI tool installation verification failed" -ForegroundColor $Red
    Write-Host "You can still run it locally with: npm start" -ForegroundColor $Yellow
}

# Setup completion message
Write-Host "🎉 $($ProjectName) setup completed!" -ForegroundColor $Green
Write-Host ""
Write-Host "🚀 Getting Started:" -ForegroundColor $Blue
Write-Host "   1. cd $($InstallPath)" -ForegroundColor $Yellow
Write-Host "   2. zippy-audit init" -ForegroundColor $Yellow -NoNewline; Write-Host " - Initialize audit system"
Write-Host "   3. zippy-audit analyze" -ForegroundColor $Yellow -NoNewline; Write-Host " - Run your first audit"
Write-Host ""
Write-Host "🌐 Your Service URLs:" -ForegroundColor $Blue

# Show the dynamic URLs based on port assignments
if (Test-Path $configPath) {
    try {
        $portConfig = Get-Content $configPath -Raw | ConvertFrom-Json
        Write-Host "📊 Web Dashboard:" -ForegroundColor $Green
        Write-Host "   $($portConfig.ports.dashboard.url)" -ForegroundColor $White
        Write-Host "   Features: Visual audit management, reports, task tracking" -ForegroundColor $Gray
        Write-Host ""
        Write-Host "🔗 API Services:" -ForegroundColor $Green
        Write-Host "   $($portConfig.ports.api.url)" -ForegroundColor $White
        Write-Host "   Features: Programmatic access to audit functionality" -ForegroundColor $Gray
        Write-Host ""
    } catch {
        Write-Host "📊 Web Dashboard:" -ForegroundColor $Yellow
        Write-Host "   http://localhost:$($dashboardPort)" -ForegroundColor $White
        Write-Host ""
        Write-Host "🔗 API Services:" -ForegroundColor $Yellow
        Write-Host "   http://localhost:$($apiPort)/api" -ForegroundColor $White
        Write-Host ""
    }
} else {
    Write-Host "📊 Web Dashboard:" -ForegroundColor $Yellow
    Write-Host "   http://localhost:$($dashboardPort)" -ForegroundColor $White
    Write-Host ""
    Write-Host "🔗 API Services:" -ForegroundColor $Yellow
    Write-Host "   http://localhost:$($apiPort)/api" -ForegroundColor $White
    Write-Host ""
}

Write-Host "📚 Documentation:" -ForegroundColor $Blue
Write-Host "   • CLI Guide: " -NoNewline; Write-Host "docs\examples\cli-usage-examples.md" -ForegroundColor $Yellow
Write-Host "   • API Reference: " -NoNewline; Write-Host "docs\api\reference.md" -ForegroundColor $Yellow
Write-Host "   • Port Configuration: " -NoNewline; Write-Host ".zippycodesaudit-ports.json" -ForegroundColor $Yellow
Write-Host ""
Write-Host "🔧 Available Commands:" -ForegroundColor $Blue
Write-Host "   zippy-audit analyze    " -NoNewline; Write-Host "- Run comprehensive analysis" -ForegroundColor $Yellow
Write-Host "   zippy-audit check      " -NoNewline; Write-Host "- Run quality checks" -ForegroundColor $Yellow
Write-Host "   zippy-audit report     " -NoNewline; Write-Host "- Generate reports" -ForegroundColor $Yellow
Write-Host "   zippy-audit init       " -NoNewline; Write-Host "- Initialize audit system" -ForegroundColor $Yellow
Write-Host "   zippy-audit config     " -NoNewline; Write-Host "- Manage configuration" -ForegroundColor $Yellow
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor $Blue
Write-Host "   • Use " -NoNewline; Write-Host "zippy-audit --help" -ForegroundColor $Yellow -NoNewline; Write-Host " for more options"
Write-Host "   • Check " -NoNewline; Write-Host "docs\" -ForegroundColor $Yellow -NoNewline; Write-Host " for detailed guides"
Write-Host "   • Run " -NoNewline; Write-Host "node scripts/port-scanner.js" -ForegroundColor $Yellow -NoNewline; Write-Host " to rescan ports if needed"
Write-Host "   • Join our community at " -NoNewline; Write-Host "https://discord.gg/zippy" -ForegroundColor $Yellow
Write-Host ""
Write-Host "Happy auditing! 🧩✨" -ForegroundColor $Green
