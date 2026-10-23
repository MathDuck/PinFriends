<#
.SYNOPSIS
    Installs PinFriends into a local Vencord clone, then builds (and optionally injects) Vencord.
    Windows (PowerShell 5.1 or 7+). For Linux / macOS use scripts/install.sh.

.PARAMETER VencordPath
    Vencord clone to use. Default: .\Vencord next to this repo (cloned if missing).

.PARAMETER Update
    git pull the Vencord clone before building.

.PARAMETER NoInject
    Build only, do not patch Discord.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
#>
param(
    [string]$VencordPath,
    [switch]$Update,
    [switch]$NoInject
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
if (-not $VencordPath) { $VencordPath = Join-Path $root "Vencord" }

# Native commands do not throw on failure in PowerShell 5.1, so check the exit code ourselves
function Invoke-Step {
    param([string]$Label, [scriptblock]$Command)
    Write-Host "==> $Label"
    & $Command
    if ($LASTEXITCODE -ne 0) { throw "'$Label' failed (exit code $LASTEXITCODE)." }
}

function Assert-Command {
    param([string]$Name, [string]$Hint)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Missing '$Name'. $Hint"
    }
}

Assert-Command git "Install Git first."
Assert-Command node "Install Node.js 22 or newer: https://nodejs.org"
Assert-Command pnpm "Install it with: npm install -g pnpm (then reopen PowerShell)"

$nodeMajor = [int](node -p "process.versions.node.split('.')[0]")
if ($nodeMajor -lt 22) { throw "Node.js 22 or newer is required (found $(node -v))." }

if (-not (Test-Path $VencordPath)) {
    Invoke-Step "Cloning Vencord into $VencordPath" {
        git clone https://github.com/Vendicated/Vencord.git $VencordPath
    }
} elseif ($Update) {
    Invoke-Step "Updating Vencord" { git -C $VencordPath pull --ff-only }
}

if (-not (Test-Path (Join-Path $VencordPath "package.json"))) {
    throw "No package.json in '$VencordPath': not a Vencord clone."
}

$dest = Join-Path $VencordPath "src\userplugins\pinFriends"
Write-Host "==> Copying plugin to $dest"
if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Copy-Item -Path (Join-Path $root "src\pinFriends\*") -Destination $dest -Recurse -Force

Push-Location $VencordPath
try {
    Invoke-Step "Installing dependencies" { pnpm install --frozen-lockfile }
    Invoke-Step "Building" { pnpm build }

    if ($NoInject) {
        Write-Host "==> Skipping inject (-NoInject). Run 'pnpm inject' in $VencordPath when ready."
    } else {
        Write-Host "Quit Discord first (tray icon > Quit), or it will keep running the old code."
        Invoke-Step "Injecting into Discord" { pnpm inject }
    }
} finally {
    Pop-Location
}

Write-Host "Done. Restart Discord, then enable PinFriends in Settings > Vencord > Plugins."
