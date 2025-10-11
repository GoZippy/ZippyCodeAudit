# ============================================================
# ZippyCodeAudit Port Scanner (PowerShell Version)
# Dynamically finds available ports to avoid conflicts
# ============================================================

param(
    [switch]$KillConflicts,
    [switch]$Force,
    [string]$ConfigPath = ".zippycodesaudit-ports.json"
)

# Port requirements for ZippyCodeAudit services
$portRequirements = @{
    "dashboard" = @{
        name = "Web Dashboard"
        default = 3001
        priority = "high"
        range = @(3000, 4000)
    }
    "api" = @{
        name = "API Services"
        default = 3000
        priority = "high"
        range = @(3000, 4000)
    }
    "monitoring" = @{
        name = "Monitoring (Optional)"
        default = 3002
        priority = "medium"
        range = @(3000, 4000)
    }
}

# Reserved ports to avoid (common system services)
$reservedPorts = @(20, 21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995, 3306, 5432, 6379, 27017, 8080, 8443, 9000, 9090, 3000, 3001, 3002, 3003, 3004, 3005)

$scanResults = @{
    available = @{}
    conflicts = @{}
    recommendations = @{}
}

Write-Host "🧩 Scanning ports for ZippyCodeAudit services..." -ForegroundColor Blue
Write-Host ""

function Test-PortAvailable {
    param([int]$Port)

    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect("localhost", $Port)
        $tcpClient.Close()
        return $false
    } catch {
        return $true
    }
}

function Get-PortProcess {
    param([int]$Port)

    try {
        $processes = netstat -ano | Select-String ":$Port "
        if ($processes) {
            return $processes[0].ToString().Trim()
        }
        return $null
    } catch {
        return $null
    }
}

function Find-OptimalPort {
    param($requirement)

    $name = $requirement.name
    $defaultPort = $requirement.default
    $range = $requirement.range
    $priority = $requirement.priority

    Write-Host "🔍 Finding port for $($name)..." -ForegroundColor Yellow

    # Check default port first
    if (Test-PortAvailable -Port $defaultPort) {
        Write-Host "✅ Default port $($defaultPort) is available for $($name)" -ForegroundColor Green
        return $defaultPort
    }

    # Check what process is using the default port
    $process = Get-PortProcess -Port $defaultPort
    Write-Host "⚠️  Default port $($defaultPort) is in use by: $($process)" -ForegroundColor Red

    if ($priority -eq "high") {
        Write-Host "🚨 Critical service $($name) needs port $($defaultPort)" -ForegroundColor Red
        $scanResults.recommendations[$name] = "Kill conflicting process or use alternative port"
    }

    # Scan preferred range
    $availablePorts = @()
    for ($port = $range[0]; $port -le $range[1]; $port++) {
        if ($port -notin $reservedPorts -and (Test-PortAvailable -Port $port)) {
            $availablePorts += $port
        }
    }

    if ($availablePorts.Count -gt 0) {
        $chosenPort = $availablePorts[0]
        Write-Host "✅ Found alternative port $($chosenPort) for $($name)" -ForegroundColor Green
        $scanResults.available[$name] = $chosenPort
        return $chosenPort
    }

    # Fallback to wider range
    Write-Host "🔄 Scanning wider range for $($name)..." -ForegroundColor Yellow
    $widerAvailable = @()
    for ($port = 4000; $port -le 9000; $port++) {
        if (Test-PortAvailable -Port $port) {
            $widerAvailable += $port
        }
    }

    if ($widerAvailable.Count -gt 0) {
        $chosenPort = $widerAvailable[0]
        Write-Host "✅ Found fallback port $($chosenPort) for $($name)" -ForegroundColor Green
        $scanResults.available[$name] = $chosenPort
        return $chosenPort
    }

    throw "No available ports found for $($name). Please free up some ports or specify custom ports."
}

# Scan all required services
$portAssignments = @{}

foreach ($service in $portRequirements.Keys) {
    $requirement = $portRequirements[$service]

    try {
        $port = Find-OptimalPort -requirement $requirement
        $portAssignments[$service] = $port

        # Store conflict info if any
        if (-not (Test-PortAvailable -Port $requirement.default)) {
            $process = Get-PortProcess -Port $requirement.default
            $scanResults.conflicts[$service] = @{
                port = $requirement.default
                process = $process
                recommended = $port
            }
        }
    } catch {
        Write-Host "❌ Failed to find port for $($requirement.name): $($_.Exception.Message)" -ForegroundColor Red
        $portAssignments[$service] = $null
    }
}

# Check for missing critical ports
$missingCritical = $portAssignments.GetEnumerator() | Where-Object {
    $service = $_.Key
    $port = $_.Value
    $requirement = $portRequirements[$service]
    $requirement.priority -eq "high" -and $port -eq $null
}

if ($missingCritical.Count -gt 0) {
    Write-Host ""
    Write-Host "🚨 CRITICAL PORT CONFLICTS DETECTED!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Critical services missing ports:" -ForegroundColor Red
    foreach ($missing in $missingCritical) {
        $service = $missing.Key
        $requirement = $portRequirements[$service]
        Write-Host "   • $($requirement.name)" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "To resolve conflicts:" -ForegroundColor Yellow
    Write-Host "   1. Run: .\check-ports.ps1 -KillConflicts" -ForegroundColor White
    Write-Host "   2. Or manually kill processes using these ports" -ForegroundColor White
    Write-Host "   3. Or stop other services using these ports" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Generate port configuration
$config = @{
    dashboard = @{
        port = $portAssignments["dashboard"]
        url = "http://localhost:$($portAssignments["dashboard"])"
        description = "Web dashboard for audit management"
    }
    api = @{
        port = $portAssignments["api"]
        url = "http://localhost:$($portAssignments["api"])/api"
        description = "API services for audit functionality"
    }
}

if ($portAssignments["monitoring"]) {
    $config["monitoring"] = @{
        port = $portAssignments["monitoring"]
        url = "http://localhost:$($portAssignments["monitoring"])"
        description = "Monitoring and health checks"
    }
}

# Save configuration
$configPath = Join-Path $PWD.Path $ConfigPath
$config | ConvertTo-Json -Depth 3 | Out-File $configPath -Encoding UTF8
$scanResults | ConvertTo-Json -Depth 3 | Out-File "$($configPath).scan-results.json" -Encoding UTF8

# Display results
Write-Host ""
Write-Host "📊 Port Scan Results:" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

foreach ($service in $portAssignments.Keys) {
    $port = $portAssignments[$service]
    $requirement = $portRequirements[$service]

    if ($port) {
        $icon = $requirement.priority -eq "high" ? "🚨" : "✅"

        Write-Host "$($icon) $($requirement.name):" -ForegroundColor Green
        Write-Host "   Port: $($port)" -ForegroundColor White
        Write-Host "   URL: $($config[$service].url)" -ForegroundColor Gray
        Write-Host "   Status: Available" -ForegroundColor Green
        Write-Host ""
    }
}

# Show conflicts if any
if ($scanResults.conflicts.Count -gt 0) {
    Write-Host "⚠️  Port Conflicts Found:" -ForegroundColor Yellow
    foreach ($conflict in $scanResults.conflicts.GetEnumerator()) {
        $service = $conflict.Key
        $conflictInfo = $conflict.Value
        Write-Host "   $($conflictInfo.port) (recommended alternative: $($conflictInfo.recommended))" -ForegroundColor Yellow
        Write-Host "   Used by: $($conflictInfo.process)" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Show access instructions
Write-Host "🌐 Access Your Services:" -ForegroundColor Cyan
Write-Host "────────────────────────" -ForegroundColor Cyan

if ($config.dashboard.port) {
    Write-Host "📊 Web Dashboard:" -ForegroundColor Green
    Write-Host "   $($config.dashboard.url)" -ForegroundColor White
    Write-Host "   Features: Visual audit management, reports, task tracking" -ForegroundColor Gray
    Write-Host ""
}

if ($config.api.port) {
    Write-Host "🔗 API Services:" -ForegroundColor Green
    Write-Host "   $($config.api.url)" -ForegroundColor White
    Write-Host "   Features: Programmatic access to audit functionality" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "   • Port configuration saved to: $($ConfigPath)" -ForegroundColor White
Write-Host "   • Use 'zippy-audit config --set dashboard.port=<port>' to change ports" -ForegroundColor White
Write-Host "   • Run 'node scripts/port-scanner.js' to rescan ports" -ForegroundColor White
Write-Host ""

Write-Host "✅ Port scanning completed!" -ForegroundColor Green
Write-Host "🚀 Ready to launch ZippyCodeAudit services!" -ForegroundColor Green

# Return port assignments for use by other scripts
return $portAssignments
