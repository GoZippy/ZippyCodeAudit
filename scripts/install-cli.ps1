# ============================================================
# ZippyCodeAudit CLI Installation Script (PowerShell)
# ============================================================

Write-Host "🧩 Installing ZippyCodeAudit CLI..." -ForegroundColor Blue

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    $majorVersion = [int]($nodeVersion -replace '^v(\d+)\..*', '$1')
    if ($majorVersion -lt 16) {
        Write-Host "❌ Node.js version 16 or higher is required. Current version: $nodeVersion" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Node.js is required but not installed." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm -v
} catch {
    Write-Host "❌ npm is required but not installed." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Create global symlink for CLI
Write-Host "🔗 Creating global CLI symlink..." -ForegroundColor Cyan

# Remove existing installation if it exists
try {
    npm uninstall -g zippycodesaudit 2>$null | Out-Null
} catch {
    # Ignore errors if package wasn't installed globally
}

# Install globally
try {
    npm install -g .
    if ($LASTEXITCODE -ne 0) {
        throw "npm install -g failed"
    }
} catch {
    Write-Host "❌ Failed to install CLI globally" -ForegroundColor Red
    exit 1
}

# Verify installation
Write-Host "✅ Verifying installation..." -ForegroundColor Cyan
try {
    $zippyAuditExists = Get-Command zippy-audit -ErrorAction SilentlyContinue
    if ($zippyAuditExists) {
        Write-Host "✅ ZippyCodeAudit CLI installed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🚀 Available commands:" -ForegroundColor Yellow
        Write-Host "   zippy-audit analyze    - Run comprehensive project analysis" -ForegroundColor Gray
        Write-Host "   zippy-audit check      - Run specific quality checks" -ForegroundColor Gray
        Write-Host "   zippy-audit report     - Generate audit reports" -ForegroundColor Gray
        Write-Host "   zippy-audit init       - Initialize audit system in project" -ForegroundColor Gray
        Write-Host "   zippy-audit config     - Manage configuration" -ForegroundColor Gray
        Write-Host "   zippy-audit --help     - Show all available options" -ForegroundColor Gray
        Write-Host ""
        Write-Host "🎯 Quick start:" -ForegroundColor Yellow
        Write-Host "   cd C:\path\to\your\project" -ForegroundColor Gray
        Write-Host "   zippy-audit init" -ForegroundColor Gray
        Write-Host "   zippy-audit analyze" -ForegroundColor Gray
    } else {
        throw "zippy-audit command not found after installation"
    }
} catch {
    Write-Host "❌ Installation verification failed." -ForegroundColor Red
    Write-Host "Please check that Node.js and npm are properly installed." -ForegroundColor Yellow
    exit 1
}
